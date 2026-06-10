import React, { useEffect, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {visible && (
        <div id="preloader">
          <div id="ep-preloader" className="ep-preloader">
            <div className="animation-preloader">
              <div className="spinner" />
            </div>
          </div>
        </div>
      )}
      <div className="cursor" />
      <div className="cursor2" />
      <div id="magic-cursor"><div id="ball" /></div>
      <div className="progress-wrap">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>
    </>
  );
}
