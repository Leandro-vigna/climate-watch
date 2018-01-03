import React from 'react';
import PropTypes from 'prop-types';
import ActionCard from 'components/my-climate-watch/my-cw-placeholder-card';
import Card from 'components/my-climate-watch/my-insights/my-cw-insight-card';
import Button from 'components/button';
import Loading from 'components/loading';

import styles from './my-insights-styles.scss';

const MyInsights = ({ loaded, insights }) => {
  if (!loaded) {
    return <Loading className={styles.loading} />;
  }
  if (!insights || !insights.length > 0) {
    return (
      <div className={styles.placeholder}>
        <p>There isn&apos;t any insight still</p>
        <Button
          className={styles.createBtn}
          color="yellow"
          href="/my-climate-watch/editor"
        >
          Create your first insight
        </Button>
      </div>
    );
  }
  return (
    <div>
      <ul className={styles.insightsContainer}>
        {insights.map(insight => (
          <li key={insight.id} className={styles.insightsCard}>
            <Card
              data={insight}
              link={`/my-climate-watch/editor/${insight.id}`}
            />
          </li>
        ))}
        <li key="action-card" className={styles.insightsCard}>
          <ActionCard
            text="Create a new insight"
            action={{ type: 'link', to: '/my-climate-watch/editor' }}
          />
        </li>
      </ul>
    </div>
  );
};

MyInsights.propTypes = {
  loaded: PropTypes.bool.isRequired,
  insights: PropTypes.array
};

export default MyInsights;
