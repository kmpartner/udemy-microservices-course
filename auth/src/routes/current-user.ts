import express from 'express';
import { currentUser } from '@sgtickets/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  console.log('currentUser', req.currentUser);
  res.send({ currentUser: req.currentUser || 'no user found' });
});

export { router as currentUserRouter };
