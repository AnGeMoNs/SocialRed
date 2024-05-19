import PropTypes from 'prop-types';
import avatar from '../../assets/img/user.png';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';

export const UserList = ({ users, getUsers, following, setFollowing, page, setPage, more, loading }) => {
    const { auth } = useAuth();

    const handleNextPage = () => {
        let next = page + 1;
        setPage(next);
        getUsers(next);
    };

    const follow = async (userId) => {
        const request = await fetch(Global.URL + "follow/save", {
            method: "POST",
            body: JSON.stringify({ followed: userId }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        const data = await request.json();
        if (data.status === 'success') {
            setFollowing([...following, userId]);
        }
    };

    const unfollow = async (userId) => {
        const request = await fetch(Global.URL + "follow/unfollow/" + userId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        const data = await request.json();
        if (data.status === 'success') {
            let filterr = following.filter(followingUserId => userId !== followingUserId);
            setFollowing(filterr);
        }
    };

    return (
        <>
            <div className="content__posts">
                {users.map((user, index) => (
                    <article className="posts__post" key={`${user._id}_${index}`}>
                        <div className="post__container">
                            <div className="post__image-user">
                                <Link to={"/social/profile/" + user._id} className="post__image-link">
                                    {user.image !== "default.png" && <img src={Global.URL + "user/avatar/" + user.image} className="post__user-image" alt="Foto de perfil" />}
                                    {user.image === "default.png" && <img src={avatar} className="post__user-image" alt="Foto de perfil" />}
                                </Link>
                            </div>
                            <div className="post__body">
                                <div className="post__user-info">
                                    <Link to={"/social/profile/" + user._id} className="user-info__name">{user.name} {user.surname}</Link>
                                    <span className="user-info__divider"> | </span>
                                    <Link to={"/social/profile/" + user._id} className="user-info__create-date">
                                        {user.created_at && <ReactTimeAgo date={user.created_at} locale="en-En" />}
                                    </Link>
                                </div>
                                <h4 className="post__content">{user.bio}</h4>
                            </div>
                        </div>
                        {user._id !== auth._id &&
                            <div className="post__buttons">
                                {!following.includes(user._id) && (
                                    <a className="post__button" onClick={() => follow(user._id)}>
                                        Follow
                                    </a>
                                )}
                                {following.includes(user._id) && (
                                    <a className="post__button" onClick={() => unfollow(user._id)}>
                                        Unfollow
                                    </a>
                                )}
                            </div>
                        }
                    </article>
                ))}
            </div>
            {loading ? "Loading..." : ""}
            {more &&
                <div className="content__container-btn">
                    <button className="content__btn-more-post" onClick={handleNextPage}>
                        See more people
                    </button>
                </div>
            }
        </>
    );
};

UserList.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object).isRequired,
    getUsers: PropTypes.func.isRequired,
    following: PropTypes.arrayOf(PropTypes.string).isRequired,
    setFollowing: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
    more: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default UserList;
