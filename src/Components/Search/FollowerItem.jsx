import styled from "styled-components";
import { UserIcon2 } from "../Common/Icon";

const FollowerContain = styled.div`
  width: 590px;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 20px;
  border-bottom: 1px solid rgba(204, 204, 204, 0.4);

  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    padding: 15px 20px;
  }

  @media (max-width: 480px) {
    padding: 10px 15px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 15px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const UserWrapper = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: ${(props) => props.theme.ImgBG};
  box-shadow: ${(props) => props.theme.ImgSH};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  path {
    fill: ${(props) => props.theme.searchColor};
  }
`;

const UserContex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
`;

const UserName = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${(props) =>
    props.isRead ? props.theme.readTextColor : props.theme.buttonText};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const UserInfo = styled.p`
  font-size: 14px;
  color: ${(props) =>
    props.isRead ? props.theme.readTextColor : props.theme.followerfont};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 10px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
  }
`;

const UserFollowerNum = styled.p`
  font-size: 12px;
  color: ${(props) => props.theme.fontcolor};

  @media (max-width: 768px) {
    font-size: 11px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const FollowerButton = styled.button`
  flex: 0 0 auto;
  width: 110px;
  border-radius: 8px;
  padding: 10px 20px;
  background: ${(props) => (props.isFollowing ? "#000" : "#fff")};
  color: ${(props) => (props.isFollowing ? "#fff" : "#000")};

  border: 1px solid ${(props) => props.theme.searchButton};
  font-weight: 700;
  cursor: pointer;

  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.isFollowing ? "#333" : "#f0f0f0")};
    color: ${(props) => (props.isFollowing ? "#fff" : "#000")};
  }

  @media (max-width: 768px) {
    width: 90px;
    padding: 8px 15px;
  }

  @media (max-width: 480px) {
    width: 80px;
    padding: 6px 10px;
  }
`;

const FollowerItem = ({ follower, toggleFollow, onProfileClick }) => {
  return (
    <FollowerContain onClick={onProfileClick}>
      <Wrapper>
        <UserWrapper>
          {follower.profileImg ? (
            <img src={follower.profileImg} alt="User profile" />
          ) : (
            <UserIcon2 width={50} height={50} />
          )}
        </UserWrapper>
        <UserContex>
          <UserName>{follower.username}</UserName>
          <UserInfo>{follower.bio || "소개 없음"}</UserInfo>
          <UserFollowerNum>{`팔로워 ${
            follower.followers || 0
          }명`}</UserFollowerNum>
        </UserContex>
      </Wrapper>
      <FollowerButton isFollowing={follower.isFollowing} onClick={toggleFollow}>
        {follower.isFollowing ? "팔로잉" : "팔로우"}
      </FollowerButton>
    </FollowerContain>
  );
};

export default FollowerItem;
