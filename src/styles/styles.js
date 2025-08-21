// styles.js

export const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '24px'
  },
  maxWidth: {
    maxWidth: '1280px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px',
    marginBottom: '24px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none'
  },
  uploadButton: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  exportButton: {
    backgroundColor: '#10b981',
    color: 'white'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  select: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  th: {
    backgroundColor: '#f9fafb',
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'top'
  },
  tr: {
    cursor: 'pointer'
  },
  badge: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '500'
  },
  score: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  urlLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#2563eb',
    fontSize: '12px',
    textDecoration: 'none',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #dbeafe',
    marginTop: '4px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    color: '#6b7280'
  },
  welcomeState: {
    textAlign: 'center',
    padding: '64px 24px',
    color: '#6b7280'
  }
};