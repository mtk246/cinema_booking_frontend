import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { maxTextTruncateLength } from './constants';

function truncateText(val, max) {
  return val.length > max ? val.slice(0, max) + '...' : val;
}

function TruncateFunc({ text, max }) {
  return <span>{truncateText(text, max)}</span>;
}

function TruncateFuncWithTooltip({ id, text, max, placementTooltip }) {
  return (
    <>
      <OverlayTrigger
        key={id}
        placement={placementTooltip}
        overlay={<Tooltip id={id}>{text}</Tooltip>}
      >
        <span>{truncateText(text, max)}</span>
      </OverlayTrigger>
    </>
  );
}

TruncateFunc.defaultProps = {
  max: maxTextTruncateLength,
};

TruncateFuncWithTooltip.defaultProps = {
  id: 'tooltip',
  max: maxTextTruncateLength,
  placementTooltip: 'top',
};

export { TruncateFunc, TruncateFuncWithTooltip };