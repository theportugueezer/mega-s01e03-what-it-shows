<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, ISSUE, SUMMARY } from '#lib/kb/problems';

  let { ticket, repo }: { ticket: number; repo: string } = $props();

  const groups = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr class:wrong={g.problem === 'unplaced'}>
        <td><code>{g.problem}</code>{#if g.problem !== 'unplaced'}<br /><span class="what">{SUMMARY[g.problem]}</span>{/if}</td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if g.problem === 'unplaced'}no tenant on file{:else}<a href="https://github.com/{repo}/issues/{ISSUE[g.problem]}">{repo}#{ISSUE[g.problem]}</a>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .wrong td { background: var(--warn-bg); }
</style>
