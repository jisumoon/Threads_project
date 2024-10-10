import React, { useState, useContext, useEffect } from "react";
import {
  ThreadDispatchContext,
  ThreadDataContext,
} from "../Contexts/ThreadContext";
import { auth, storage, db } from "../firebase";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { useMediaQuery } from "react-responsive";
import Button from "../Components/Common/Button";
import Post from "../Components/Post";
import {
  PlusIcon,
  InstaIcon,
  FacebookIcon,
  UserIcon2,
} from "../Components/Common/Icon";
import {
  ProfileInnner,
  IdWrap,
  IdText,
  Tap,
  TextInput,
  Desk,
} from "../styles/MobileProfile";
import FollowModal from "../Components/profile/FollowModal";
import LinkPluse from "../Components/profile/LinkPluse";
import ProfileEdit from "../Components/profile/ProfileEdit";
import TimeLine from "../Components/TimeLine";
import { useNavigate, useSearchParams } from "react-router-dom";
import OtherBtnModal from "../Components/profile/OtherBtnModal";

const BoederWrapper = styled.div`
  margin: 0 auto;
  width: 680px;
  height: 85%;
  border-radius: 40px 40px 0px 0px;
  background: ${(props) => props.theme.borderWrapper};
  box-shadow: ${(props) => props.theme.bordershadow};
  padding: 10px 0;
  @media (max-width: 768px) {
    border-radius: 0;
    width: 100vw;
    height: calc(100% - 140px);
    box-shadow: none;
    margin: 0px;
    border-radius: 0px;
    background-color: ${(props) => props.theme.bodyBg};
  }
`;

const ProfileWrap = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const ImgWrap = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  border-radius: 50px;
  overflow: hidden;
`;
const Img = styled.img`
  width: 100%;
`;

const Nick = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${(props) => props.theme.fontcolor};
`;

const BottomWrap = styled.div`
  width: 100%;
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
  gap: 25px;
  @media screen and (max-width: 768px) {
    gap: 8px;
  }
`;

const FollowLink = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Follow = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.nomalIconColor};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Links = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const LinkPlus = styled.div`
  border: 1px solid ${(props) => props.theme.nomalIconColor};
  border-radius: 50px;
  width: 24px;
  height: 24px;
  text-align: center;
  path {
    stroke: ${(props) => props.theme.nomalIconColor};
  }
`;

const PulsLinkIcon = styled.div`
  width: 50px;
  height: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  path {
    width: 22px;
    height: 22px;
    text-align: center;
    stroke: ${(props) => props.theme.fontcolor};
  }
`;

const ThreadInner = styled.div`
  width: 100%;
`;

const PostWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 10px;
`;

const Profile = () => {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const navigate = useNavigate();
  const user = auth.currentUser; //유저정보

  const [avatar, setAvarta] = useState(null || undefined); //이미지관리목적
  const [posts, setPosts] = useState([]); //데이터베이스에 객체형태로 정의된 데이터들
  const [editbtn, setEditbtn] = useState(true);
  // searchParams = email 받아오기
  const [searchParams] = useSearchParams();
  const emailAdress = searchParams.get("email");
  //console.log(emailAdress);

  const data = useContext(ThreadDataContext);
  const { createThread, updateThread, deleteThread, updateProfile } =
    useContext(ThreadDispatchContext);
  const [lastemail, setLastEmail] = useState("");
  //모달관련 state
  const [followModal, setFollowModal] = useState(false);
  const [linkmodal, setLinkModal] = useState(false);
  const [editmodal, setEditModal] = useState(false);
  const [otherBtn, setOtherBtn] = useState(false);
  const [profile, setProfile] = useState({
    postId: "",
    username: "",
    userId: "",
    userEmail: "",
    bio: "",
    isLinkPublic: true,
    isProfilePublic: true,
    img: `${avatar ?? ""}`,
  });

  const buttonCheck = () => {
    if (user?.email === emailAdress) {
      setEditbtn(true);
    } else {
      setEditbtn(false);
    }
  };

  const CheckProfile = async () => {
    try {
      const profileQuery = query(
        collection(db, "profile"),
        where("userEmail", "==", emailAdress)
      );
      const querySnapshot = await getDocs(profileQuery);
      //db에 firebase에 사람이 있다면 ?
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0].data(); //이메일이 프로필db에 있는 사람의 데이터.
        const imgUrl = profileDoc.img;
        // const imgUrl = ref(storage, `avatars/${profileDoc.userId}`);

        // 에러
        setAvarta(imgUrl);
        //유저 정보가 있다면
        if (!profileDoc.empty) {
          setProfile((prev) => ({
            ...prev,
            postId: profileDoc.postId,
            username: profileDoc.username,
            userEmail: profileDoc.userEmail,
            bio: profileDoc.bio,
            isLinkPublic: profileDoc.isLinkPublic,
            isProfilePublic: profileDoc.isProfilePublic,
            img: imgUrl,
          }));
          console.log(profile);
          console.log("있다");
        }
      } else {
        // 사람이 없다면?
        console.log("음따");
        console.log(profile);
        setProfile((prev) => ({
          ...prev,
          postId: "",
          username: emailAdress,
          userEmail: emailAdress,
          bio: "",
          isLinkPublic: true,
          isProfilePublic: true,
          img: null,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile: ", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    CheckProfile();
    buttonCheck();
  }, []);

  const onfollow = () => {
    setFollowModal((prev) => !prev);
    //팔로우 클릭
  };

  const onLinkPlus = () => {
    setLinkModal((prev) => !prev);
    //아이콘추가
  };

  const onProfileEdite = () => {
    setEditModal((prev) => !prev);
    //프로필수정모달
  };

  const onOtherbtn = () => {
    setOtherBtn((prev) => !prev);
    //프로필수정모달
  };
  const fetchPosts = async () => {
    //하단에 띄울 쓰레드 스테이트 관리 함수
    const postQuery = query(
      collection(db, "contents"),
      where("email", "==", emailAdress), //파람즈 값으로 변경하자
      orderBy("createdAt", "desc"),
      limit(15)
    );
    const snapShot = await getDocs(postQuery); //필터된 포스터 가져옴
    const post = snapShot.docs.map((doc) => {
      const { createdAt, email, photos, post, userId, username, videos } =
        doc.data();
      return {
        createdAt,
        email,
        photos,
        post,
        userId,
        username,
        videos,
      };
    });
    setPosts(post);
  };

  const handleProfileChange = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <BoederWrapper>
      {followModal ? (
        <FollowModal open={true} close={onfollow} />
      ) : (
        <FollowModal open={false} close={onfollow} />
      )}
      {linkmodal ? (
        <LinkPluse open={true} close={onLinkPlus} />
      ) : (
        <LinkPluse open={false} close={onLinkPlus} />
      )}
      {editmodal ? (
        <ProfileEdit
          open={true}
          close={onProfileEdite}
          profile={profile}
          onProfileChange={handleProfileChange}
        />
      ) : (
        <ProfileEdit
          open={false}
          close={onProfileEdite}
          profile={profile}
          onProfileChange={handleProfileChange}
        />
      )}
      {otherBtn ? (
        <OtherBtnModal open={true} close={onOtherbtn} profile={profile} />
      ) : (
        <OtherBtnModal open={false} close={onOtherbtn} profile={profile} />
      )}
      <>
        <ProfileInnner isSmallScreen={isSmallScreen}>
          <ProfileWrap>
            <IdWrap isSmallScreen={isSmallScreen}>
              <Nick> {profile.username}</Nick>
              <IdText isSmallScreen={isSmallScreen}>{emailAdress}</IdText>
            </IdWrap>
            <ImgWrap isSmallScreen={isSmallScreen}>
              {Boolean(avatar) ? (
                <Img src={avatar} />
              ) : (
                <UserIcon2 width="54" fill="#BABABA" />
              )}
            </ImgWrap>
          </ProfileWrap>
          <BottomWrap>
            <Desk isSmallScreen={isSmallScreen}>
              {profile.bio ?? "프로필을 꾸며보세요!"}
            </Desk>
            <FollowLink>
              <Follow onClick={onfollow}>팔로워 1234</Follow>
              {profile.isLinkPublic ? (
                <Links>
                  <LinkPlus onClick={onLinkPlus}>
                    <PlusIcon width="16px" />
                  </LinkPlus>
                  <PulsLinkIcon>
                    <InstaIcon />
                    <FacebookIcon />
                  </PulsLinkIcon>
                </Links>
              ) : null}
            </FollowLink>
            {user.email === emailAdress ? (
              <Button type="edit" text="프로필 수정" onClick={onProfileEdite} />
            ) : (
              <Button type="edit" text="팔로잉" onClick={onOtherbtn} />
            )}
          </BottomWrap>
        </ProfileInnner>
        <ThreadInner>
          <Tap isSmallScreen={isSmallScreen}>
            <li>스레드</li>
            <li>답글</li>
            <li>리포트</li>
            <li>인스타</li>
          </Tap>
          <PostWrap>
            {posts.map((post) => (
              <Post key={post.id} {...post} />
            ))}
          </PostWrap>
        </ThreadInner>
      </>
    </BoederWrapper>
  );
};

export default Profile;

{
  /* <Nick> {profile.username ?? user.uid ?? emailAdress}</Nick> */
}
