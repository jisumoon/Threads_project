import React, { useState } from "react";
import styled from "styled-components";
// import { IPost } from "./TimeLine";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

// Styled Components
const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 20px;
`;

const Column = styled.div`
  display: flex;
`;

const Photo = styled.img`
  width: 200px;
  height: 100%;
  border-radius: 15px;
`;

const Video = styled.video`
  width: 250px;
  height: 100%;
  border-radius: 15px;
`;

const Username = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

const Payload = styled.p`
  font-size: 18px;
  margin: 10px 0;
`;

const Button = styled.button`
  background: ${(props) => props.bg || "#7f8689"};
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
`;

const EditorColumns = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EditPostFormTextArea = styled.textarea`
  background: #000;
  color: #fff;
  width: 94%;
  height: 50%;
  padding: 10px;
  margin: 10px 0;
  font-size: 16px;
  border-radius: 10px;
  resize: none;

  &::placeholder {
    opacity: 1;
    transition: opacity 0.3s;
  }

  &:focus::placeholder {
    opacity: 0;
  }

  &:focus {
    outline: none;
    border: 1px solid #1d9bf0;
  }
`;

const SetContentButton = styled.label`
  color: #fff;
  transition: color 0.3s;

  &:hover {
    color: #1d9bf0;
  }

  svg {
    width: 24px;
    cursor: pointer;
  }
`;

const SetContentInputButton = styled.input`
  display: none;
`;

const Post = ({ post, userId, photos, video, username, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState(post);
  const [editedPhoto, setEditedPhoto] = useState(null);

  const user = auth.currentUser;

  const onChange = (e) => {
    setEditedPost(e.target.value);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onClickSetContent = (e) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      setEditedPhoto(files[0]);
    }
  };

  const onDelete = async () => {
    if (
      confirm("Are you sure you want to delete this post?") &&
      user?.uid === userId
    ) {
      try {
        await deleteDoc(doc(db, "contents", id));
        if (photos.length > 0) {
          const photoRef = ref(storage, `contents/${user.uid}/${id}`);
          await deleteObject(photoRef);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onUpdate = async () => {
    if (user?.uid !== userId) return;

    try {
      const postDoc = await getDoc(doc(db, "contents", id));
      if (!postDoc.exists()) throw new Error("Document does not exist");

      const postData = postDoc.data();
      const existingFileType = postData?.fileType || null;
      const newFileType = editedPhoto?.type.startsWith("image/")
        ? "image"
        : "video";

      if (editedPhoto) {
        if (existingFileType && existingFileType !== newFileType) {
          alert("You can only upload the same type of content");
          return;
        }

        const locationRef = ref(storage, `contents/${user.uid}/${id}`);
        const uploadTask = uploadBytesResumable(locationRef, editedPhoto);

        if (editedPhoto.size >= 5 * 1024 * 1024) {
          uploadTask.cancel();
          throw new Error("File Size is over 5MB");
        }

        const result = await uploadTask;
        const url = await getDownloadURL(result.ref);

        await updateDoc(doc(db, "contents", id), {
          post: editedPost,
          photos: newFileType === "image" ? [...photos, url] : photos,
          video: newFileType === "video" ? url : video,
          fileType: newFileType,
        });
      } else {
        await updateDoc(doc(db, "contents", id), { post: editedPost });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {isEditing ? (
          <EditPostFormTextArea
            onChange={onChange}
            value={editedPost}
            placeholder={post}
          />
        ) : (
          <Payload>{post}</Payload>
        )}

        <EditorColumns>
          {user?.uid === userId && (
            <>
              {isEditing ? (
                <>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button bg="#1d9bf0" onClick={onUpdate}>
                    Update
                  </Button>
                  <SetContentButton htmlFor="edit-content">
                    <svg
                      fill="none"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    <SetContentInputButton
                      id="edit-content"
                      type="file"
                      accept="video/*, image/*"
                      onChange={onClickSetContent}
                    />
                  </SetContentButton>
                </>
              ) : (
                <Button onClick={handleEdit}>Edit</Button>
              )}

              <Button bg="#ff6347" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
        </EditorColumns>
      </Column>

      {/* Render multiple photos */}
      {photos && photos.length > 0 && (
        <Column>
          {photos.map((photoUrl, index) => (
            <Photo key={index} src={photoUrl} alt={`Post Image ${index + 1}`} />
          ))}
        </Column>
      )}

      {video && (
        <Column>
          <Video src={video} autoPlay loop />
        </Column>
      )}
    </Wrapper>
  );
};

export default Post;
