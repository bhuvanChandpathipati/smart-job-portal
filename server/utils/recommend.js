// Rule-based job matching: no external AI, API keys or network access.
const LEVELS = ['Entry Level', 'Junior', 'Mid Level', 'Senior'];
const EDU = ['Diploma', 'Bachelor', 'Master', 'PhD'];

// "Node.js", "NodeJS", "node js" -> "node"; "React.js" -> "react"
const norm = (s) => {
  let n = String(s).toLowerCase().replace(/[^a-z0-9+#]/g, '');
  if (n.length > 3 && n.endsWith('js')) n = n.slice(0, -2);
  return n;
};

function computeMatch(profile, job) {
  const studentSkills = new Map((profile?.skills || []).map((s) => [norm(s), s]));
  const required = job.skills || [];
  const matchingSkills = required.filter((s) => studentSkills.has(norm(s)));
  const missingSkills = required.filter((s) => !studentSkills.has(norm(s)));
  const skillMatch = required.length ? Math.round((matchingSkills.length / required.length) * 100) : 0;

  const sl = Math.max(0, LEVELS.indexOf(profile?.experienceLevel || 'Entry Level'));
  const jl = Math.max(0, LEVELS.indexOf(job.experienceLevel || 'Entry Level'));
  const expScore = sl >= jl ? 100 : sl === jl - 1 ? 50 : 0;

  const se = Math.max(0, EDU.indexOf(profile?.educationLevel || 'Bachelor'));
  const re = job.jobType === 'Internship' ? 0 : 1;
  const eduScore = se >= re ? 100 : 50;

  // Weighted: skills 70%, experience 20%, education 10%
  const matchPercentage = Math.round(skillMatch * 0.7 + expScore * 0.2 + eduScore * 0.1);

  let explanation = `You match ${matchingSkills.length} of ${required.length} required skills (${skillMatch}%). `;
  explanation += expScore === 100 ? 'Your experience level fits this role. ' :
    expScore === 50 ? 'This role is one level above your experience, but still reachable. ' :
    'This role needs more experience than your profile shows. ';
  if (missingSkills.length) explanation += `Learn ${missingSkills.slice(0, 4).join(', ')} to improve your match.`;
  else if (required.length) explanation += 'You have every required skill.';

  return { matchPercentage, skillMatch, matchingSkills, missingSkills,
    experienceMatch: expScore === 100, educationMatch: eduScore === 100, explanation: explanation.trim() };
}
module.exports = { computeMatch, LEVELS, EDU };
