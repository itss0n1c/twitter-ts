# twitter-ts
A Javascript library for interacting with the Twitter API 

<br>

## Installation
```bash
% yarn add twitter-ts
```

## Setup
Create a `.env` file containing the following:
```
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
```
The tokens and secrets are available at https://developer.twitter.com

## Usage
```ts
import { TwitterAPI } from 'twitter-ts';
import { config } from 'dotenv';

config();

const api = new TwitterAPI();

api.tweets.fetch("20").then(user => {
	console.log(user)
})
```

## Result Examples
```js
Tweet {
	entities: { hashtags: [], symbols: [], user_mentions: [], urls: [] },
	id: '20',
	full_text: 'just setting up my twttr',
	source: '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>',
	user: User {
		entities: { description: [Object] },
		id: '12',
		name: 'jack',
		username: 'jack',
		bio: '#bitcoin',
		followers: 5388241,
		following: 4659,
		likes: 33131,
		created_at: 'Tue Mar 21 20:50:14 +0000 2006',
		verified: true,
		pfp: 'https://pbs.twimg.com/profile_images/1115644092329758721/AFjOr-K8.jpg',
		banner: 'https://pbs.twimg.com/profile_banners/12/1584998840',
		location: '',
		color: '990000',
		tweets_count: 27477,
		url: null
	},
	created_at: 'Tue Mar 21 20:50:14 +0000 2006',
	likes: 165836,
	shares: 121628
}
```

```js
User {
  entities: { description: { urls: [] } },
  id: '12',
  name: 'jack',
  username: 'jack',
  bio: '#bitcoin',
  followers: 5388241,
  following: 4659,
  likes: 33131,
  created_at: 'Tue Mar 21 20:50:14 +0000 2006',
  verified: true,
  pfp: 'https://pbs.twimg.com/profile_images/1115644092329758721/AFjOr-K8.jpg',
  banner: 'https://pbs.twimg.com/profile_banners/12/1584998840',
  location: '',
  color: '990000',
  tweets_count: 27477,
  url: null
}
```
