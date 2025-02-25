import React from 'react';
import Progress from 'components/progress';
import AbbrReplace from 'components/abbr-replace';
import PropTypes from 'prop-types';
import styles from './legend-item-styles.scss';

const LegendItem = ({
  name,
  number,
  value,
  color,
  itemsName,
  hoverIndex,
  selectActiveDonutIndex,
  disableAbbr
}) => (
  <div
    className={styles.legendItem}
    onMouseEnter={() => selectActiveDonutIndex(hoverIndex)}
  >
    <div className={styles.legendName}>
      <span className={styles.legendDot} style={{ backgroundColor: color }} />
      <span>{disableAbbr ? name : <AbbrReplace>{name}</AbbrReplace>}</span>
    </div>
    <div className={styles.progressContainer}>
      <Progress value={value} className={styles.progressBar} color={color} />
      <div className={styles.partiesNumber}>
        {number} {number === 1 ? itemsName[0] : itemsName[1]}
      </div>
    </div>
  </div>
);

LegendItem.propTypes = {
  name: PropTypes.string,
  number: PropTypes.number,
  itemsName: PropTypes.array,
  value: PropTypes.number,
  hoverIndex: PropTypes.number.isRequired,
  color: PropTypes.string,
  selectActiveDonutIndex: PropTypes.func.isRequired,
  disableAbbr: PropTypes.bool
};

LegendItem.defaultProps = {
  itemsName: ['Party', 'Parties']
};

export default LegendItem;
