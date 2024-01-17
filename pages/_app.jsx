import "../styles/globals.sass";
import "../styles/defaults.sass";
import "../styles/nav.sass";
import "../styles/easy_edit.sass";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';
import { Nav } from "../components";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsCookie from "js-cookie";
import {
  legacy_createStore as createStore,
  compose,
  applyMiddleware,
} from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import rootReducer from "../store/reducer/rootReducer";
import "./style.css";
import Head from "next/head";
import { UserProvider } from "../middleware/UserContext";

export default function App({ Component, pageProps }) {
    const [tokenName, setTokenName] = useState("");
    const [pageTitle, setPageTitle] = useState("");
    const router = useRouter();

    const capitalizeTitle = (title) => {
        const words = title.split(/(?=[A-Z])/);
        const capitalizedWords = words.map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1)
        );

        return capitalizedWords.join(" ");
    };

    useEffect(() => {
        const token = jsCookie.get("token");
        const role = jsCookie.get("role");

        if (token && token !== tokenName) {
            setTokenName(token);
        } else if (
            !token &&
            router.pathname !== "/account/login"
        ) {
            router.replace("/account/login");
        }

        const pageTitle = router.pathname.split("/")[1].replace(/([A-Z])/g, " $1").trim();
        setPageTitle(capitalizeTitle(pageTitle));

        if (router.pathname === "/") {
            router.replace("/movie_management");
        }
    }, [router, tokenName]);

    let composeEnhancers = compose;
    if (typeof window !== "undefined") {
        composeEnhancers =
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    }

    const store = createStore(
        rootReducer,
        composeEnhancers(applyMiddleware(thunk))
    );

    return (
        <Provider store={store}>
            <Head>
                <title>iManage Factory | {pageTitle}</title>
                <meta name="description" content="iManage by Khit Kabar" />
                <link rel="icon" href="/img/logo.svg" />
            </Head>
            <UserProvider>
                <ToastContainer position="bottom-center" />
                {tokenName !== "" ? (
                    <Nav>
                        <Component {...pageProps} />
                    </Nav>
                ) : (
                    <Component {...pageProps} />
                )}
            </UserProvider>
        </Provider>
    );
}
