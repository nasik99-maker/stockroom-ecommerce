const statusMap = {
  pending: 'tag-amber',
  paid: 'tag-navy',
  shipped: 'tag-navy',
  delivered: 'tag-forest',
  cancelled: 'tag-rust',
};

export default function StatusTag({ status }) {
  return <span className={`tag ${statusMap[status] || 'tag-navy'}`}>{status}</span>;
}
