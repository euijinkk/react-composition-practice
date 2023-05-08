import { useRouter } from "next/router";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export default function Page() {
  return (
    <ToastProvider>
      <ErrorBoundary fallback={<ErrorPage />}>
        <Suspense fallback={<Loading />}>
          <UserGuard>
            <Content />
          </UserGuard>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
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

const ToastContext = createContext({ showToast(message: string) {} });
const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState("");
  const [isOpenToast, setIsOpenToast] = useState(false);
  const toastTimer = useRef<NodeJS.Timeout>();

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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isOpenToast && <Toast message={message} />}
    </ToastContext.Provider>
  );
};

function LoggingPage({
  pageName,
  pageTitle,
  children,
}: {
  pageName: string;
  pageTitle: string;
  children: ReactNode;
}) {
  // Mount 시에 amplitude 를 활용한 page log 를 찍는다.
  useEffect(() => {
    amplitude.getInstance().logEvent("viewed-page", {
      pageName,
      pageTitle,
      url: window.location.href,
    });
  }, [pageName, pageTitle]);

  return <>{children}</>;
}

function Content() {
  // 유저 정보가 있으면, 좋아요 리스트를 가지고 오는 Query
  const likeListQuery = useQuery(["likeList"], () => getLikeList(), {
    suspense: true,
  });

  const { showToast } = useContext(ToastContext);

  // Mount 시에 scroll을 최상단까지 올린다.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <LoggingPage pageName="Home" pageTitle="My Awesome Website">
      <div>
        <button onClick={() => showToast("show toast")}>Show Toast!</button>
      </div>
    </LoggingPage>
  );
}
