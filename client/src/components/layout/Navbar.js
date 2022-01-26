import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { logout } from '../../actions/auth';

const Navbar = () => {
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, loading } = auth;
  console.log('isAuthenticated', isAuthenticated, 'loading', loading);

  const authLinks = (
    <ul>
      {' '}
      <li>
        {' '}
        <Link to='/' onClick={() => dispatch(logout())}>
          {' '}
          <i className='fas fa-sign-out-alt' />{' '}
          <span className='hide-sm'>Logout</span>{' '}
        </Link>{' '}
      </li>{' '}
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to='/profiles'>Developers</Link>
      </li>
      <li>
        <Link to='/register'>Register</Link>
      </li>
      <li>
        <Link to='/login'>Login</Link>
      </li>
    </ul>
  );
  return (
    <nav className='navbar bg-dark'>
      <h1>
        <Link to='/'>
          <i className='fas fa-code'></i> Developers' Network
        </Link>
      </h1>
      <Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>
    </nav>
  );
};

export default Navbar;
