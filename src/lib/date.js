export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const submissionDate = new Date(parseInt(timestamp) * 1000);
  const diffMs = now - submissionDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins || 1}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};

export const formatDate = (startTime) => {
  if (!startTime) return "";
  const d = new Date(startTime * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
