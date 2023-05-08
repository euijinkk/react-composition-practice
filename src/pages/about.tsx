import { useRouter } from "next/router";
import { ReactNode, useEffect, useRef, useState } from "react";

export default function Page() {
  // 유저 정보를 가지고 오는 Query
  const meQuery = useQuery(["me"], () => getMe());
  // 유저 정보가 있으면, 좋아요 리스트를 가지고 오는 Query
  const likeListQuery = useQuery(["likeList"], () => getLikeList(), {
    enable: meQuery.data != null,
  });

  const router = useRouter();

  // 토스트 로직
  const [message, setMessage] = useState("");
  const toastTimer = useRef<NodeJS.Timeout>();
  const [isOpenToast, setIsOpenToast] = useState(false);
  const showToast = (message: string) => {
    setIsOpenToast(true);
    setMessage(message);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    const timer = setTimeout(() => {
      setIsOpenToast(false);
      setMessage("");
    }, 3000);
    toastTimer.current = timer;
  };

  // Mount 시에 amplitude 를 활용한 page log 를 찍는다.
  useEffect(() => {
    amplitude.getInstance().logEvent("viewed-page", {
      pageName: "Home",
      pageTitle: "My Awesome Website",
      url: window.location.href,
    });
  }, []);

  // Mount 시에 scroll을 최상단까지 올린다.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // 유저 정보가 없을 경우, Login 시키기
  useEffect(() => {
    if (meQuery == null) {
      router.push("/login");
    }
  }, []);

  // Query 로딩을 처리한다.
  if (meQuery.isLoading || likeListQuery.isLoading) {
    return <Loading />;
  }

  // Query 에러를 처리한다.
  if (meQuery.isError || likeListQuery.isError) {
    return <ErrorPage />;
  }

  // 유저 정보가 없을 경우, Guard
  if (meQuery == null) {
    return null;
  }

  return (
    <div>
      <button onClick={() => showToast("show toast")}>Show Toast!</button>
      {isOpenToast && (
        <Toast message={message} onClick={() => setIsOpenToast(false)} />
      )}
    </div>
  );
}

function Toast() {}
