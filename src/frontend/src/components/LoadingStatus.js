import React from "react";

const LoadingStatus = ({barStatus}) => {
    console.log(`Render loading status ${JSON.stringify(barStatus)}`);
    return <div className="loading-bar" style={{"backgroundColor": barStatus.color}}>{barStatus.loadingStatus}</div>
};

export default LoadingStatus