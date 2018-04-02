import React, { PureComponent } from 'react';
import Proptypes from 'prop-types';
import Icon from 'components/icon';
import cx from 'classnames';
import { Link } from 'react-router-dom';

import closeIcon from 'assets/icons/legend-close.svg';
import styles from './tag-styles.scss';

class Tag extends PureComponent {
  render() {
    const { data, onRemove, className, canRemove } = this.props;
    return data.url ? (
      <Link to={data.url} className={cx(styles.tag, className)}>
        <span className={styles.dot} style={{ backgroundColor: data.color }} />
        <p className={styles.label}>{data.label}</p>
        {canRemove && (
          <button className={styles.closeButton} onClick={() => onRemove(data)}>
            <Icon icon={closeIcon} className={styles.icon} />
          </button>
        )}
      </Link>
    ) : (
      <li className={cx(styles.tag, className)}>
        <span className={styles.dot} style={{ backgroundColor: data.color }} />
        <p className={styles.label}>{data.label}</p>
        {canRemove && (
          <button className={styles.closeButton} onClick={() => onRemove(data)}>
            <Icon icon={closeIcon} className={styles.icon} />
          </button>
        )}
      </li>
    );
  }
}

Tag.propTypes = {
  data: Proptypes.object,
  onRemove: Proptypes.func,
  className: Proptypes.string,
  canRemove: Proptypes.bool
};

Tag.defaultPropTypes = {
  canRemove: false
};

export default Tag;
