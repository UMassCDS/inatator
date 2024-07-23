import React from "react";

const LoadingStatus = ({barStatus}) => {
    console.log('Render loading status');
    return <div className="loading-bar" style={{"backgroundColor": barStatus.color}}><p id="loading-status">{barStatus.loadingStatus}</p></div>
};

export default LoadingStatus