import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { loadJson } from "./util";

export function WebmentionsApp() {
  ReactDOM.render(
    <Webmentions mentions={mentions} />,
    document.getElementById("mentions")
  );
}

function Webmentions() {
  const [mentions, setMentions] = useState(null);

  useEffect(() => {
    const url = new URL(
      `${window.location.protocol}//${window.location.host}/webmention/get`
    );
    url.searchParams.append("url", window.location.pathname);

    loadJson(url)
      .then(data => data.mentions)
      .then(setMentions)
      .catch(console.error);
  }, []);

  if (mentions && mentions.length > 0) {
    return <MentionsContainer mentions={mentions} />;
  }
  return null;
}

function MentionsContainer(props) {
  const mentions = props.mentions;

  // Insert into existing card if available, or create new card if none
  const cardExists = document.getElementById("related_content");
  if (!cardExists) {
    document.getElementById("mentions").classList.add("card");
  }

  return (
    <div className={"mentions overflow" + (cardExists ? "" : " card-content")}>
      <h3>Mentions</h3>
      {mentions.map(m => (
        <Webmention key={m.published} webmention={m} />
      ))}
    </div>
  );
}

function Webmention(props) {
  const mention = props.webmention;
  const avatarStyle = {
    backgroundImage: `url(${mention.hcard.avatar})`,
  };
  return (
    <div className="mention-mini">
      <div className="tooltip">
        <a
          className="mention-source"
          aria-label="Mention source"
          href={"" + mention.source_url}
        >
          <div className="avatar mention-avatar" style={avatarStyle}></div>
        </a>
        <div className="tooltip-popup hcard-popup">
          <div className="hcard-popup flex-row-start">
            <a
              className="hcard-homepage"
              aria-label="Mention author homepage"
              href={"" + mention.hcard.homepage}
            >
              <div className="hcard-content">
                <div className="hcard-name">{mention.hcard.name}</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
