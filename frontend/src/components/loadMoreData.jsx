const LoadMoreDataBtn = ({ state, fetchDataFunc }) => {
  
    if (state !== null && state.totalDocs > state.results.length) {
         
        return (
            <button
                onClick={() => fetchDataFunc({ page: state.page + 1 })}
                className="text-gray-600 p-2 px-3 hover:bg-gray-300 rounded-3xl flex items-center gap-2">
                Load More
            </button>
        )
    }
}

export default LoadMoreDataBtn