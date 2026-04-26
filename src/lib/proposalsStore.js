// proposalsStore.js — Supabase CRUD for cluster_proposals + approved_clusters.
// v2: Persists cluster_structure (pillar + spokes) and generates linking plans.
// All writes must complete before UI shows success (architectural principle #1).

import { supabase } from './supabase.js';
import { generatePageTitles, generateLinkingPlan } from './opportunityEngine.js';

const REJECTION_WINDOW_DAYS = 30;

// ── Reads ────────────────────────────────────────────────────────────────────
export async function listProposals() {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('cluster_proposals')
    .select('*')
    .in('status', ['proposed','rejected'])
    .or(`rejected_until.is.null,rejected_until.lt.${nowIso}`)
    .order('score', { ascending: false });
  if (error) throw error;
  return (data || []).filter(p => {
    if (p.status !== 'rejected') return true;
    if (!p.rejected_until) return true;
    return new Date(p.rejected_until) < new Date();
  }).filter(p => p.status === 'proposed');
}

export async function listSnoozedProposals() {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('cluster_proposals')
    .select('*')
    .eq('status', 'rejected')
    .gt('rejected_until', nowIso)
    .order('rejected_until', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listApprovedClusters() {
  const { data, error } = await supabase
    .from('approved_clusters')
    .select('*')
    .order('approved_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Writes ───────────────────────────────────────────────────────────────────
export async function upsertProposals(proposals) {
  if (!proposals || proposals.length === 0) return { inserted: 0, updated: 0 };

  const hashes = proposals.map(p => p.source_hash).filter(Boolean);
  const { data: existing, error: exErr } = await supabase
    .from('cluster_proposals')
    .select('id, source_hash, status, rejected_until')
    .in('source_hash', hashes);
  if (exErr) throw exErr;

  const byHash = new Map((existing || []).map(r => [r.source_hash, r]));
  const now = new Date();

  let inserted = 0, updated = 0;
  for (const p of proposals) {
    const prev = byHash.get(p.source_hash);
    if (prev) {
      if (prev.status === 'rejected' && prev.rejected_until && new Date(prev.rejected_until) > now) {
        continue;
      }
      const { error } = await supabase
        .from('cluster_proposals')
        .update({
          title: p.title,
          description: p.description,
          type: p.type,
          page_count: p.page_count,
          score: p.score,
          signals_json: p.signals_json,
          cluster_structure: p.cluster_structure || null,
          status: 'proposed',
          rejected_until: null,
        })
        .eq('id', prev.id);
      if (error) throw error;
      updated++;
    } else {
      const { error } = await supabase
        .from('cluster_proposals')
        .insert({
          title: p.title,
          description: p.description,
          type: p.type,
          page_count: p.page_count,
          score: p.score,
          signals_json: p.signals_json,
          cluster_structure: p.cluster_structure || null,
          source_hash: p.source_hash,
          status: 'proposed',
        });
      if (error) throw error;
      inserted++;
    }
  }
  return { inserted, updated };
}

export async function rejectProposal(id) {
  const until = new Date(Date.now() + REJECTION_WINDOW_DAYS * 86400000).toISOString();
  const { error } = await supabase
    .from('cluster_proposals')
    .update({ status: 'rejected', rejected_until: until })
    .eq('id', id);
  if (error) throw error;
}

export async function unsnoozeProposal(id) {
  const { error } = await supabase
    .from('cluster_proposals')
    .update({ status: 'proposed', rejected_until: null })
    .eq('id', id);
  if (error) throw error;
}

export async function approveProposal(proposal) {
  const pageTitles = generatePageTitles(proposal);
  const linkingPlan = generateLinkingPlan(proposal);

  const { data, error } = await supabase
    .from('approved_clusters')
    .insert({
      proposal_id: proposal.id,
      title: proposal.title,
      type: proposal.type,
      page_titles: pageTitles,
      cluster_structure: proposal.cluster_structure || null,
      linking_plan: linkingPlan,
      pushed_to_builder_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;

  const { error: upErr } = await supabase
    .from('cluster_proposals')
    .update({ status: 'approved' })
    .eq('id', proposal.id);
  if (upErr) throw upErr;

  return data;
}
