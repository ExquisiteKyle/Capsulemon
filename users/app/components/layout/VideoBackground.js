"use client";

import styles from "../../page.module.css";

const VideoBackground = () => {
  return (
    <>
      <video
        key="background-video"
        className={styles.videoBackground}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={(e) => console.error("Video error:", e)}
        onLoadStart={() => console.log("Video loading started")}
        onCanPlay={() => console.log("Video can play")}
        onPlay={() => console.log("Video started playing")}
      >
        <source src="/videos/bg_vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className={styles.videoOverlay}></div>
    </>
  );
};

export default VideoBackground;
