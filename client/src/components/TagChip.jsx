export default function TagChip({ tag, onRemove, small }) {
  const style = tag.color
    ? {
        background: `${tag.color}18`,
        color: tag.color,
        borderColor: `${tag.color}25`,
      }
    : {};

  return (
    <span className="tag-chip" style={style}>
      {tag.name}
      {onRemove && (
        <span
          className="tag-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          role="button"
          aria-label={`Remove tag ${tag.name}`}
        >
          ×
        </span>
      )}
    </span>
  );
}
