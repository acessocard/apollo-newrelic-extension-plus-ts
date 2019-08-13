import * as R from 'ramda';
import { GraphQLExtension } from 'graphql-extensions/dist/index';
import gql from 'graphql-tag';
import { fieldTraceSummary } from './field-trace-summary';

const errorCount = R.pipe(
  R.propOr([], 'errors'),
  R.length as any
);

export class NewRelicExtensionPlus extends GraphQLExtension {
  newrelic: any;

  constructor(newrelic: any) {
    super();
    this.newrelic = newrelic;
  }
  requestDidStart(obj: any) {
    const { queryString, variables, persistedQueryHit } = obj;
    const queryObject = gql`
      ${queryString}
    `;
    const transactionName = queryObject.definitions[0].selectionSet.selections.reduce((init: any, q: any, idx: any) => (idx === 0 ? `${q.name.value}` : `${init}, ${q.name.value}`), '');
    this.newrelic.setTransactionName(`graphql (${transactionName})`);
    this.newrelic.addCustomAttribute('gqlQuery', queryString);
    this.newrelic.addCustomAttribute('gqlVars', JSON.stringify(variables));
    this.newrelic.addCustomAttribute('persistedQueryHit', persistedQueryHit);
  }

  willSendResponse({ graphqlResponse }: any) {
    const tracingSummary = R.pipe(
      R.pathOr([], ['extensions', 'tracing']),
      fieldTraceSummary
    )(graphqlResponse);
    this.newrelic.addCustomAttribute('traceSummary', tracingSummary);
    this.newrelic.addCustomAttribute('errorCount', errorCount(graphqlResponse));
  }
}
