import { useEffect, useState, useCallback, useRef } from 'react';
import { Global } from '../../helpers/Global';
import { PublicationList } from '../publication/PublicationList';

export const Feed = () => {
    const [publications, setPublications] = useState([]);
    const [page, setPage] = useState(1);
    const [more, setMore] = useState(true);
    const publicationsRef = useRef([]);

    const getPublications = useCallback(async (nextPage = 1, showNews = false) => {
        if (showNews) {
            setPublications([]);
            setPage(1);
            nextPage = 1;
        }
        const request = await fetch(Global.URL + "publication/feed/" + nextPage, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        const data = await request.json();
        if (data.status === "success") {
            let newPublications = data.publications;

            if (!showNews && publicationsRef.current.length >= 1) {
                newPublications = [...publicationsRef.current, ...data.publications];
            }

            publicationsRef.current = newPublications;
            setPublications(newPublications);

            if (!showNews && publicationsRef.current.length >= (data.total - data.publications.length)) {
                setMore(false);
            }
            if (data.pages <= 1) {
                setMore(false);
            }
        }
    }, []);

    useEffect(() => {
        getPublications(1, false);
    }, [getPublications]);

    return (
        <>
            <header className="content__header">
                <h1 className="content__title">Publications</h1>
                <button className="content__button" onClick={() => getPublications(1, true)}>Update posts</button>
            </header>

            <PublicationList
                publications={publications}
                getPublications={getPublications}
                page={page}
                setPage={setPage}
                more={more}
                setMore={setMore}
            />
            <br />
        </>
    );
};

export default Feed;





