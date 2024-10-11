import React, { useMemo, useEffect, useState } from "react";
import styled from "styled-components";
import { UserIcon2 } from "../Common/Icon";
import { motion, useMotionValue, useAnimate } from "framer-motion";

const Contain = styled.div``;

const NotificationContain = styled(motion.div)`
  position: relative;
  width: 590px;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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

const DeleteButton = styled(motion.div)`
  position: absolute;
  height: 82px;
  top: 27%;
  right: 40px;
  display: grid;
  place-content: center;
  width: 70px;
  aspect-ratio: 1/1;
  background: crimson;
`;

const DeleteLabel = styled(motion.p)`
  color: #fff;
  font-size: 14px;
  font-weight: 300;
`;

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  color: ${(props) =>
    props.isRead ? props.theme.borderstroke : props.theme.fontcolor};

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

const User = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
`;

const UserName = styled.p`
  font-size: 14px;
  font-weight: 700;
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

const UserDate = styled.p`
  font-size: 12px;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const NotificationItem = React.memo(
  ({ profileImg, username, createdAt, onClick, isRead, message, type }) => {
    //날짜
    const formattedDate = useMemo(() => {
      const getTimeDifference = (timestamp) => {
        if (!timestamp) return "날짜 없음";
        const now = new Date();
        const diffInMs = now - new Date(timestamp);
        const diffInHours = diffInMs / (1000 * 60 * 60);
        console.log(`NotificationItem received isRead: ${isRead}`);
        if (diffInHours < 24) {
          return `${Math.floor(diffInHours)}시간 전`;
        } else if (diffInHours < 24 * 7) {
          return `${Math.floor(diffInHours / 24)}일 전`;
        } else if (diffInHours < 24 * 30) {
          return `${Math.floor(diffInHours / (24 * 7))}주 전`;
        } else {
          return `${Math.floor(diffInHours / (24 * 30))}달 전`;
        }
      };
      return getTimeDifference(createdAt);
    }, [createdAt]);

    //삭제버튼
    const [isDeleteShow, setIsDeleteShow] = useState(false);
    const itemX = useMotionValue(0); // 임계치를 넘는 순간 애니메이션 발생
    const deleteAnimateState = isDeleteShow ? "appear" : "disappear";
    const [animateRef, animate] = useAnimate();

    useEffect(() => {
      itemX.on("change", (v) => {
        const isOverThreshold = v < -64 / 2;

        setIsDeleteShow(isOverThreshold);
      });
    }, [itemX]);

    return (
      <>
        <Contain>
          <DeleteButton
            initial="disappear"
            animate={deleteAnimateState}
            variants={{ appear: { opacity: 1 }, disappear: { opacity: 0 } }}
          >
            <DeleteLabel
              variants={{
                appear: { scale: 1 },
                disappear: { scale: 0 },
              }}
            >
              삭제
            </DeleteLabel>
          </DeleteButton>
          <NotificationContain
            whileTap="click"
            drag="x"
            dragElastic={2}
            dragMomentum={false}
            dragConstraints={{ left: -0.1, right: 0 }}
            style={{
              x: itemX,
            }}
            onDragEnd={() => {
              const isOverThreshold = itemX.get() < -64 / 2;

              animate(animateRef.current, { x: isOverThreshold ? -64 : 0 });
            }}
            ref={animateRef}
          >
            <Wrapper onClick={onClick} isRead={isRead}>
              <UserWrapper>
                {profileImg ? (
                  <img src={profileImg} alt="User profile" />
                ) : (
                  <UserIcon2 width={50} />
                )}
              </UserWrapper>
              <UserContex>
                <User>
                  {type === "friend" && <UserInfo>친한친구</UserInfo>}
                  <UserName>{username}</UserName>
                  <UserInfo>{message}</UserInfo>
                </User>
                <UserDate>{formattedDate}</UserDate>
                {isRead && <UserDate>읽음</UserDate>}
              </UserContex>
            </Wrapper>
          </NotificationContain>
        </Contain>
      </>
    );
  }
);

export default NotificationItem;
