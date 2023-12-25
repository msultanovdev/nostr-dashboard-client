import { useEffect, useState, FC } from "react";
import cl from "./PostCard.module.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import {
  ArrowRepeat,
  Chat,
  HandThumbsUp,
  ImageFill,
  Lightning,
  PlayBtnFill,
} from "react-bootstrap-icons";
import { Button } from "react-bootstrap";
import { formatAMPM } from "../../utils/formatDate";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";
import UserIcon from "../../assets/user.png";
import { Link, useNavigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import { copyUrl } from "../../utils/copyFunctions";
import { NDKEvent } from "@nostrband/ndk";
import { statsType } from "../../types/types";
import Gallery from "../Gallery/Gallery";
import { formatContent, formatNostrContent } from "../../utils/formatContent";

type postItemType = {
  name: string;
  picture: string;
  about: string;
  pubkey: string;
  createdDate: number;
  eventId: string;
  thread: string;
  taggedProfiles?: (NDKEvent | string)[];
  title?: string;
  kindName?: string;
};

const PostItem: FC<postItemType> = ({
  name,
  picture,
  about,
  pubkey,
  createdDate,
  eventId,
  thread,
  taggedProfiles,
  title,
  kindName,
}) => {
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState<statsType>({});
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const createdDateAt = new Date(createdDate * 1000);
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [content, setContent] = useState(about);

  useEffect(() => {
    const newContent = formatNostrContent(
      about,
      taggedProfiles ? taggedProfiles : [],
    );
    setContent(newContent);
  }, []);

  const navigate = useNavigate();

  const note = nip19.noteEncode(eventId);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/event/${eventId}`,
      );

      setStats(data.stats[eventId]);
    } catch (e) {
      console.log(e);
    }
  };

  const isSameType = () =>
    contents.every((obj) => obj.type === contents[0].type);

  const contents = formatContent(about);

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }
    setNpubKey(nip19.npubEncode(pubkey));
    setNprofile(nip19.nprofileEncode({ pubkey: pubkey }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sats = stats.zaps?.msats ? stats.zaps.msats / 1000 : null;

  return (
    <div className={cl.post}>
      {thread && <p className={cl.replyTo}>In a thread by {thread}</p>}
      <div className={cl.postName}>
        <Link to={`/${npubKey}`}>
          <div className={cl.postImage}>
            {!imgError ? (
              picture ? (
                <img
                  src={picture}
                  alt="avatar"
                  onError={() => setImgError(true)}
                />
              ) : (
                <img alt="avatar" src={UserIcon} />
              )
            ) : (
              <img
                src={`https://media.nostr.band/thumbs/${pubkey.slice(
                  -4,
                )}/${pubkey}-picture-64`}
                alt="avatar"
                onError={({ currentTarget }) => {
                  currentTarget.srcset = UserIcon;
                }}
              />
            )}
          </div>
        </Link>
        <Link className={cl.postNameLink} to={`/${npubKey}`}>
          {name}
        </Link>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle
            variant="light"
            size="sm"
            id="dropdown-basic"
          ></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item target="_blanc">
              <Link to={`/${npubKey}`} style={{ all: "unset" }}>
                Open
              </Link>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(npubKey)}>
              Copy npub
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(nprofile)}>
              Copy nprofile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(pubkey)}>
              Copy pubkey
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {title && (
        <div>
          <b>{title.slice(0, 100)}</b>
        </div>
      )}
      <div
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          navigate(`/${note}`);
        }}
      >
        <MarkdownComponent content={content} mode={""} />
      </div>
      <div className={cl.postStats}>
        {sats && (
          <div className={cl.postState}>
            <Lightning />
            <span>
              {Number(sats) > 1000000
                ? `${Math.round(sats / 1000000)}M`
                : Number(sats) >= 1000
                  ? `${Math.round(sats / 1000)}K`
                  : sats}
            </span>
          </div>
        )}
        {stats.reply_count && (
          <div className={cl.postState}>
            <Chat />
            <span>{stats.reply_count}</span>
          </div>
        )}
        {stats.repost_count && (
          <div className={cl.postState}>
            <ArrowRepeat />
            <span>
              {stats.repost_count > 1000
                ? `${Math.round(stats.repost_count / 1000)}K`
                : stats.repost_count}
            </span>
          </div>
        )}
        {stats.reaction_count && (
          <div className={cl.postState}>
            <HandThumbsUp />
            <span>
              {stats.reaction_count > 1000
                ? `${Math.round(stats.reaction_count / 1000)}K`
                : stats.reaction_count}
            </span>
          </div>
        )}

        <div className={cl.postState}>
          <Link to={`/${note}`}>
            <span>
              {kindName && `Kind ${kindName}, `}
              {formatAMPM(createdDateAt.getTime())}
            </span>
          </Link>
        </div>
      </div>
      <div className={cl.btnLink}>
        {contents && contents.length ? (
          isBannerVisible ? (
            <Button variant="light" onClick={() => setIsBannerVisible(false)}>
              Hide
            </Button>
          ) : (
            <Button variant="light" onClick={() => setIsBannerVisible(true)}>
              {isSameType() ? (
                contents[0].type === "PictureType" ? (
                  <>
                    Show <ImageFill />
                  </>
                ) : (
                  <>
                    Show <PlayBtnFill />
                  </>
                )
              ) : (
                <>
                  Show <ImageFill /> <PlayBtnFill />
                </>
              )}
            </Button>
          )
        ) : (
          ""
        )}
      </div>
      <Gallery contents={contents} isBannerVisible={isBannerVisible} />
    </div>
  );
};

export default PostItem;
