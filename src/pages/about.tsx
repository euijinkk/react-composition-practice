import { useRouter } from "next/router";
import { ReactNode, useEffect, useRef, useState } from "react";

export default function Page() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Loading />}>
        <UserGuard>
          <Content />
        </UserGuard>
      </Suspense>
    </ErrorBoundary>
  );
}

function UserGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  // 유저 정보를 가지고 오는 Query
  const meQuery = useQuery(["me"], () => getMe(), { suspense: true });

  // 유저 정보가 없을 경우, Login 시키기
  useEffect(() => {
    if (meQuery == null) {
      router.push("/login");
    }
  }, []);

  // 유저 정보가 없을 경우, Guard
  if (meQuery == null) {
    return null;
  }

  return <>{children}</>;
}

function Content() {
  // 유저 정보가 있으면, 좋아요 리스트를 가지고 오는 Query
  const likeListQuery = useQuery(["likeList"], () => getLikeList(), {
    suspense: true,
  });

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

  return (
    <div>
      <button onClick={() => showToast("show toast")}>Show Toast!</button>
      {isOpenToast && (
        <Toast message={message} onClick={() => setIsOpenToast(false)} />
      )}
    </div>
  );
}
