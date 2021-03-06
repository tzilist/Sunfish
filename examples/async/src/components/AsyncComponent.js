import React, { PureComponent } from 'react';
import { func, bool, array } from 'prop-types';
import { connect } from 'sunfish';

const mapStateToProps = (state) => {
  const {
    isFetchingData,
    fetchDataError,
    fetchDataSuccess,
    data,
  } = state;

  return {
    isFetchingData,
    fetchDataError,
    fetchDataSuccess,
    data,
  };
};

class AsyncComponent extends PureComponent {
  static propTypes = {
    createTransaction: func.isRequired,
    isFetchingData: bool.isRequired,
    fetchDataError: bool.isRequired,
    fetchDataSuccess: bool.isRequired,
    data: array.isRequired,
  }

  async componentDidMount() {
    const { createTransaction } = this.props;


    createTransaction()
      .pipeAndUpdate(this.setIsFetchingData)
      .pipe(this.fetchBeerData)
      .pipe(this.setDataFetchError, this.checkForFetchError)
      .pipe(this.setDataFetchSuccess)
      .update();
  }

  // The return here does not have state, context, or break key
  // Sunfish assumes the return is the new state
  setIsFetchingData = state => (
    {
      state: {
        ...state,
        isFetchingData: true,
      },
    }
  )

  // This function will tell Sunfish to skip any subsequent steps
  // It is important to functions that return a `break` statement need
  // a conditional on them to ensure they aren't run if they aren't needed
  setDataFetchError = state => (
    {
      state: {
        ...state,
        fetchDataError: true,
        isFetchingData: false,
      },
      break: true,
    }
  );


  setDataFetchSuccess = async (state, { data }) => {
    const results = await data.json();
    return {
      state: {
        ...state,
        data: results,
        fetchDataSuccess: true,
        isFetchingData: false,
      },
    };
  }

  fetchBeerData = async () => {
    const data = await fetch('https://api.punkapi.com/v2/beers');
    // only context is passed here
    // Sunfish will not update the current state, but will only update the context
    // in the current transaction
    return { context: { data } };
  }

  checkForFetchError = (state, context) => context.data.status !== 200;


  render() {
    const {
      fetchDataError,
      fetchDataSuccess,
      isFetchingData,
    } = this.props;
    if (isFetchingData) {
      return 'Pending';
    }

    if (fetchDataError) {
      return 'Error fetching data :(';
    }

    if (fetchDataSuccess) {
      const { data } = this.props;
      return data.map(el => <div>{el.name}</div>);
    }
    return null;
  }
}

export default connect(mapStateToProps)(AsyncComponent);
