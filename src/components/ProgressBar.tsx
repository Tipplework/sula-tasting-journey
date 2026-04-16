interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-track w-full">
      <div className="progress-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}
