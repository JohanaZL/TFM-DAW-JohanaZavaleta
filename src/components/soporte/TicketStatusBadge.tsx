import clsx from 'clsx';

interface Props {
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED';
}

const labels: Record<Props['status'], string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  RESOLVED: 'Resuelto',
};

const styles: Record<Props['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  IN_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200',
};

export const TicketStatusBadge = ({ status }: Props) => (
  <span
    className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      styles[status]
    )}
  >
    {labels[status]}
  </span>
);
