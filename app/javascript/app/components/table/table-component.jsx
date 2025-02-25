import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MultiSelect from 'components/multiselect';
import cx from 'classnames';
import difference from 'lodash/difference';
import 'react-virtualized/styles.css'; // only needs to be imported once

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import ScrollSync from 'react-virtualized/dist/commonjs/ScrollSync';
import Table from 'react-virtualized/dist/commonjs/Table/Table';
import Column from 'react-virtualized/dist/commonjs/Table/Column';

import cellRenderer from './cell-renderer-component';
import headerRowRenderer from './header-row-renderer-component';
import styles from './table-styles.scss';
import { deburrCapitalize } from '../../utils/utils';
import { getTableWidth, getResponsiveWidth } from './table-utils';

function TableComponent(props) {
  const {
    data,
    hasColumnSelect,
    activeColumns,
    columnsOptions,
    handleColumnChange,
    setRowsHeight,
    setColumnWidth,
    headerHeight,
    sortBy,
    sortDirection,
    handleSortChange,
    ellipsisColumns,
    setOptionsOpen,
    setOptionsClose,
    toggleOptionsOpen,
    optionsOpen,
    horizontalScroll,
    firstColumnHeaders,
    flexGrow,
    splittedColumns,
    theme,
    titleLinks
  } = props;
  const rightTable = useRef();
  useEffect(() => {
    if (rightTable && rightTable.current) {
      rightTable.current.scrollLeft = rightTable.current.scrollWidth;
    }
  }, [rightTable]);

  const rowClassName = ({ index }) => {
    if (index < 0) return cx(styles.headerRow, theme.headerRow);

    return index % 2 === 0
      ? cx(styles.evenRow, theme.row, theme.evenRow)
      : cx(styles.oddRow, theme.row, theme.oddRow);
  };

  if (!data || !data.length) return null;
  const hasColumnSelectedOptions = hasColumnSelect && columnsOptions;
  const activeColumnNames = activeColumns.map(c => c.value);
  const firstColumns =
    firstColumnHeaders.filter(c => activeColumnNames.includes(c)) || [];
  const columnData = firstColumns.concat(
    difference(activeColumnNames, firstColumnHeaders)
  );

  const renderTable = ({ onScroll, scrollTop, position, width }) => {
    const yearColumns = activeColumnNames.filter(
      c => !firstColumns.includes(c)
    );
    const splittedColumnData = {
      left: firstColumns,
      right: yearColumns,
      full: columnData
    }[position];
    const tableWidth = getTableWidth(position, width);
    const splittedActiveColumns = {
      left: firstColumns,
      right: yearColumns,
      full: activeColumns
    }[position];

    return (
      <div
        className={styles[position]}
        style={{ width: tableWidth }}
        ref={position === 'right' ? rightTable : undefined}
      >
        <Table
          onScroll={position === 'full' ? undefined : onScroll}
          scrollTop={position === 'full' ? undefined : scrollTop}
          className={cx(styles.table, {
            [styles.tableLeft]: position === 'left'
          })}
          width={getResponsiveWidth(
            splittedActiveColumns.length,
            tableWidth,
            position === 'left'
          )}
          height={460}
          headerHeight={headerHeight}
          rowHeight={setRowsHeight(splittedActiveColumns)}
          rowCount={data.length}
          rowClassName={rowClassName}
          sort={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          rowGetter={({ index }) => data[index]}
          headerRowRenderer={({ className, columns, style }) =>
            headerRowRenderer({ className, columns, style, theme })
          }
        >
          {splittedColumnData.map(column => (
            <Column
              className={cx(
                styles.column,
                {
                  [styles.ellipsis]:
                    ellipsisColumns && ellipsisColumns.indexOf(column) > -1
                },
                theme.column
              )}
              headerClassName={cx(styles.columnHeader, theme.columnHeader)}
              key={column}
              label={deburrCapitalize(column)}
              dataKey={column}
              flexGrow={flexGrow}
              maxWidth={setColumnWidth(column)}
              width={setColumnWidth(column)}
              cellRenderer={cell =>
                cellRenderer({
                  props: { ...props, titleLinks },
                  cell
                })
              }
            />
          ))}
        </Table>
      </div>
    );
  };

  renderTable.propTypes = {
    onScroll: PropTypes.func.isRequired,
    scrollTop: PropTypes.number,
    position: PropTypes.number,
    width: PropTypes.number
  };

  return (
    <div className={cx({ [styles.hasColumnSelect]: hasColumnSelect })}>
      {hasColumnSelectedOptions && (
        <div
          role="button"
          tabIndex={0}
          className={cx(styles.columnSelectorWrapper, theme.columnSelector)}
          onBlur={toggleOptionsOpen}
          onMouseEnter={setOptionsOpen}
          onMouseLeave={setOptionsClose}
        >
          <MultiSelect
            parentClassName={styles.columnSelector}
            values={activeColumns || []}
            options={columnsOptions || []}
            onMultiValueChange={handleColumnChange}
            hideResetButton
            open={optionsOpen}
          >
            <span className={styles.selectorValue}>...</span>
          </MultiSelect>
        </div>
      )}
      <div
        className={cx(
          styles.tableWrapper,
          {
            [styles.horizontalScroll]: !splittedColumns && horizontalScroll
          },
          theme.tableWrapper
        )}
      >
        <AutoSizer disableHeight>
          {({ width }) =>
            (splittedColumns ? (
              <ScrollSync>
                {({ onScroll, scrollTop }) => (
                  <div className={styles.scrollTable}>
                    {renderTable({
                      onScroll,
                      scrollTop,
                      position: 'left',
                      width
                    })}
                    {renderTable({
                      onScroll,
                      scrollTop,
                      position: 'right',
                      width
                    })}
                  </div>
                )}
              </ScrollSync>
            ) : (
              renderTable({
                position: 'full',
                width
              })
            ))
          }
        </AutoSizer>
      </div>
    </div>
  );
}

TableComponent.propTypes = {
  data: PropTypes.array,
  optionsOpen: PropTypes.bool,
  hasColumnSelect: PropTypes.bool,
  flexGrow: PropTypes.number,
  activeColumns: PropTypes.array,
  columnsOptions: PropTypes.array,
  handleColumnChange: PropTypes.func,
  setRowsHeight: PropTypes.func.isRequired,
  setColumnWidth: PropTypes.func.isRequired,
  headerHeight: PropTypes.number.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  handleSortChange: PropTypes.func.isRequired,
  setOptionsOpen: PropTypes.func.isRequired,
  setOptionsClose: PropTypes.func.isRequired,
  toggleOptionsOpen: PropTypes.func.isRequired,
  ellipsisColumns: PropTypes.array, // 'Columns with ellipsis intext, not full columns'
  horizontalScroll: PropTypes.bool.isRequired,
  splittedColumns: PropTypes.bool,
  firstColumnHeaders: PropTypes.array.isRequired,
  theme: PropTypes.object,
  titleLinks: PropTypes.array
};

TableComponent.defaultProps = {
  headerHeight: 30,
  horizontalScroll: false,
  splittedColumns: false,
  firstColumnHeaders: [],
  flexGrow: 1,
  theme: {}
};

export default TableComponent;
