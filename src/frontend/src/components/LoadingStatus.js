import React from "react";

const LoadingStatus = ({barStatus}) => {

    return <div className="loading-bar" style={{"backgroundColor": barStatus.color}}><p id="loading-status">{barStatus.loadingStatus}</p></div>
};

export default LoadingStatus