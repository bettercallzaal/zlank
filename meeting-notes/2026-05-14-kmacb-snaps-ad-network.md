# kmacb.eth x Zaal - Snaps as web-embedded units

**Date:** 2026-05-14
**Participants:** Zaal (BetterCallZaal), kmacb.eth (FID 4163, Footy App founder)
**Context:** Follow-up call after the zlank ad-canvas v2 ship. First real talk-shop session on the direction.

---

## TL;DR

- kmacb's core thesis: Snaps are interactive web widgets that are wrongly trapped inside Farcaster. They should run anywhere on the open web.
- "Ad" is probably the wrong framing to lead with, even though the money model looks ad-like. Find a better frame.
- **The big unlock: zlank already solves the hardest technical problem.** zlank's web route deliberately softens the JFS signature requirement when not in a Farcaster client context. kmacb was going to have to go build this; zlank already did it. He did not know it was there until he read the repo. Neither did Zaal, fully.
- kmacb's concrete near-term build: a JavaScript embed snippet/SDK (drop-in like Google Analytics) that places Snaps on any webpage. His next step is trying to get zlank's Snaps to render and be interactive inside that embed.
- The progression that matters: anon can use a Snap -> authenticate so we know their FID -> eventually trusted enough that "this widget can sign for me" (cast, etc.).
- Validates the zlank partner-template direction and the /suggest feature: Zaal explicitly wants brand-templated Snaps (Empire Builder named again) and a collective place for people to add suggestions.

---

## The thesis (kmacb's framing)

- He looks at Snaps and sees "a new web widget" - interactive mini apps that could go anywhere on the web but currently do not.
- zlank looked "pretty close" to that: a website where you can partially interact with Snaps. "This is the snap builder part."
- Scoped to a money model: these could be interactive units you drop a snippet for on a webpage. The page does a match: who is viewing, which publisher, what Snap inventory fills that space.
- The matching/feed layer: use the Hypersnap hub / snapchain to get a feed of casts that contain Snaps, queried and filtered to match advertiser to user. Like the social feed, but a feed of Snap-bearing casts.
- The unit keeps all Snap properties: dynamic, personalizable when authenticated. Example he keeps returning to: a sports betting / prediction-market Snap that has your friends in it, living out on the open web or in someone else's feed, not stuck in a client.

## The JFS unlock - zlank already solves a hard problem

- JFS = JSON Farcaster Signature. The Snap protocol requires a JFS-verified signature on every POST / interaction.
- kmacb: this is "way overblown." "You shouldn't need to know anything about me for me to hit the next button in a snap."
- Farcaster did not tier the actions. A "next page" tap and a token transfer are treated the same: all require full signer / JFS authority. No low / medium / high risk split.
- **What zlank does:** it has an API route and a web route. The web route's code effectively says: if not in the context of a client (web view), soften the signature requirements. kmacb confirmed this by reading the repo - "intentionally or not, you did the thing I was going to have to go build."
- Cassie (Cassie Heart, Quilibrium) publicly agreed the requirement is too locked down. kmacb raises these points to Neynar in public, semi-passive-aggressively, "because I know Reece reads every one of those."
- kmacb's blocker with neynar-hosted Snaps: every button press goes back to the host and fails the signature verify. zlank's web route gets past it by filtering ("I'm on the web, I don't have this signature").
- He mentioned HATS / "haatz" (H-A-A-T-Z, one of Cassie's projects) as a tool he usually reaches for on the signature issue - worth investigating.

## kmacb's concrete near-term build: the embed SDK

- A JavaScript snippet, think SDK but really just a script tag - like dropping Google Analytics. "Put this in your header" with your ID.
- Place it on a website, declare where the Snap should show up (banner, right nav, etc.) - like declaring an ad slot.
- It auto-populates based on a channel. Like an embed.
- **His immediate next step: get zlank's Snaps to show up and be interactive inside this embed widget**, because zlank's Snaps already render on the web with partial interaction. This is the integration point between his work and zlank.
- There are "four methods" to build / interact with a Snap: API route, web route, compose cast, and using the API to build the thing. (He referenced four; the transcript names these.)

## Hypersnap / $SNAPS economics

- Apps that onboard new users earn the most rewards.
- Users of any app that uses Hypersnap are also an incentive.
- $SNAPS is now fairly widely distributed and has a meaningful spam filter (the sybil-ring sweep).
- There is a "call option" alignment: everyone can push to grow this where engagement is authentic.
- New from Hypersnap: a GraphQL layer - queries plus webhooks, listen for events on a ruleset. kmacb sees this as the filtering mechanism (e.g. only show amplification from specific people).

## What "ad" should mean - the reframe

- kmacb: "even saying the word ad is thinking about it wrong." He needs a better frame.
- Zaal's model: cultivate a community of culture people want to be in, with an underlying incentive that lets the creators inside a brand earn through the brand.
- The best advertisers for a brand are the people inside its community who believe in it most - the ones who would do it for free. Pay them and they do a better job.
- Web2 instinct (hire an outside ad agency) is the mistake: agencies make generic ads, they do not see what is special about a given ecosystem.
- Only true fans / mutual follows should be able to earn from amplification. Filter out bad influencers.
- Reference point: "Influence" (the orange app) - peer-to-peer, $5 minimum budget, pay people to recast/like, paid 7-70 cents based on a "mind share" score, had a heat map. Directionally interesting, "not the best it could be," and attracted AI-spam farmers because there was no filtering on who could earn.

## Onboarding out of the walled garden

- The growth move: get out of the Farcaster walled garden, put Snaps out on the open web and in other social contexts (a WordPress site, a Twitch chat).
- Onboarding path: a simple poll Snap -> "want free crypto? make a Farcaster, claim some" -> tap the Snap -> QR / claim. Anyone can claim, but you claim as a Farcaster user, and it routes through a wallet. Hypersnap onboarding rewards make this worth doing.
- Twitch angle: Zaal and a community member are going deep on Twitch (the musician who onboarded them moved his community to Twitch). Young audience, willing to spend, "internet money is not a foreign concept" - they have just heard bad things and need correct education, especially around crypto. Snaps would be a good onboarding surface there.

## ZAO context (Zaal, for shared understanding)

- Zaal is building a community layer: a pile of primitives others can see, clone, and build on. Goal is to synthesize ideas into at least a draft as fast as possible.
- Building a Farcaster client, currently gated to ZAO governance-token holders. The token is illiquid, SOL-bound, earned weekly through participation.
- That client's front end is intentionally minimal: 4 channels + the trending feed from Sofa. "Community hub, do not distract me with the noise."
- ZAO incubates projects; members organize social capital to form sweat-equity teams with the chemistry, consistency, and resources of the larger org.
- **The Respect Game / Fractal:** weekly meetings, groups of 6 share what they did to advance the ecosystem (tech and art). The group reaches consensus ranking 1st-6th; token distributes on a Fibonacci curve (higher ranks get notably more). Scales fractally: 36+ people means top of each group of 6 forms a new fractal of 6. Just hit week 99; week 100 next. Learned from Eden Fractal / Optimism Fractal (lineage: Fractally, originally on EOS). ZAO Fractal is theirs.
- Zaal wants a trust network where "whales" are people who have supported consistently over time, not people with the most money.
- Working style: young, idealistic, open-source-first, "make all my ideas synthesized as quickly as possible to at least a draft." Has many ideas that never made it through the resource pipeline; sees now as the best time.

## People + projects mentioned

- **Cassie Heart** (Quilibrium) - publicly agreed the JFS requirement is too strict; runs the sybil-ring detection; created HATS/haatz.
- **Neynar / Reece** - kmacb lobbies them in public.
- **Intori (@DB)** - "SCIS" = Structured Conversational Inventory System. Quiz-based; collecting strong data on how people interact on Farcaster; privacy-focused, "discover your people." Zaal is partnering with DB. kmacb is skeptical: "farming preferences, same thing Web2 did, now in Web3" - wants a clear "what is in this for me" / community incentive.
- **A NYC identity project** (name unremembered, maybe not "Interface") - LinkedIn-style skill attestations on EAS (Ethereum Attestation Service), public and queryable.
- **Shaw Makes Magic** - coined "AI slop filter" at ETH Boulder; Zaal liked the term. Zaal wants community-shareable filters anyone can toggle.
- **MVR / Monteco** - the massive sybil ring (kmacb: "if I said a million accounts I would not be off"). Caught over ~4 passes; only 2 of real value slipped through (biggest miss ~1,100 $SNAPS); Cassie updated the algorithm after.
- **Empire Builder** - Zaal named it again as a brand he wants templated Snaps for.
- **Sofa** - source of the trending feed in Zaal's client.

## Action items / next steps

- **kmacb:** try to get zlank Snaps rendering and interactive inside his embed widget/SDK. This is the concrete integration point.
- **zlank:** the JFS-relaxation on the web route is the load-bearing feature - understand it fully, harden it, and make sure it survives. It is why kmacb is interested.
- **zlank:** investigate HATS/haatz for the signature path; investigate Hypersnap's new GraphQL queries + webhooks as the advertiser/user matching + filtering layer.
- **zlank:** keep building - Empire Builder templates, more partner mini-app templates. The /suggest feature already shipped matches Zaal's "collective people adding suggestions" goal.
- **Both:** get people together to build the embed / matching layer. kmacb wants to learn the data behind it.
- **Framing:** find a better word than "ad." Lead with the community/creator-earnings frame, not the ad frame.

## Open questions

- What is the right non-"ad" framing to lead with publicly?
- How exactly does zlank's web route soften the JFS requirement, and is it robust enough to be the foundation kmacb builds the embed on? (See `snap-resources/signer-and-fips.md`.)
- Does the embed widget pull Snap inventory from a Hypersnap-queried feed, or from zlank directly, or both?
- What is the advertiser <-> user match logic, and where does it run?

## Related

- `snap-resources/signer-and-fips.md` - the JFS / scoped-signer FIP situation
- `snap-resources/building-snaps.md` - Snap build + embed alpha
- Project memory: `project-zlank-collaborator-kmacb`

---

## Raw transcript

> Lightly cleaned auto-transcript of the call. Kept verbatim for grounding; the
> synthesis above is the interpreted version.

Not... What about it is, how's it going? It's going all right. Cheers. It's going all right. I like your ceiling. I just started just FYI. We've both got views of each other's ceiling here. This is great. Yeah. It's the only way I hide my chins, you know? Yeah. No, that's funny. Uh, yeah, I'm on my laptop, um, which is why, but, uh, yeah, dude, um, so Snaps.

I'm, uh- Yeah, yeah ... I'm excited to ta- talk shop about it. So when I see those things, I'm like, "Okay, this is, like, a new web widget. Why are they stuck in farcaster?" Right? Like, I, I just look at them as this, like, interactive thing, these little mini apps that could go anywhere and exist on the web, but they're, but they don't.

Um, so when I see your thing, I'm just like, "Oh, that's pretty close, and look, oh, you can even interact sort of with them. He did something to let me interact with them." Um, I'm like, "Okay, this is, this is inspirational. Maybe we can move these out into the, the web and..." I, I use, like, an ad unit, uh, but that's probably not the framing we w- we want initially.

Um- Yeah ... but, uh, anyway, the point is that these are web widgets that an anon user should be able to use. They should be able to then authenticate, so at least we know their FID. Oh, this person is this FID. And then eventually they may be trusted enough to say, "This widget should be able to sign for me," and cast and stuff like that.

Um, so the, so when I look at these things, I'm like, "Okay, if, if we were to then, okay, scope that down to, okay, how can we make money from this?" Um, these could be interactive ad units, right? Mm-hmm. And you just drop a snippet on a webpage. It's gonna then do a, this match saying, "Okay, who's viewing? Which publisher?

And what inventory do I have of Snaps that I can fill into that, that space?" And that's kind of the fun, easy part. We can use... I, I say easy. Um, anyway, bad habit. Uh, we can, we can use, uh, the, the HyperSnap, uh, hub or snap chain, whatever, to say, "Okay, here's a feed," just like the social feed, but here's a feed of casts that have snaps in them that we've queried and filtered to match the advertiser to the user.

Okay? Yeah. No, that's super interesting. But that, that unit then is something that's, you know, it's got all the properties of a snap. It's dynamic. It can be personalized if you're authenticated. So you can get things like a, a sports betting prediction market, whatever kind of snap that's, like, got your friends as part of it and, like, it, there's this really kinda cool thing that should exist outside of a client- Mm-hmm

out on the web in the wild, or in somebody else's feed or something, right? Um, so anyway, that's why I get excited about these, these snaps, and when I saw your stuff, I'm like, "Oh, this is the snap builder part. This is, like, the kind of build this- this app, and I'm like, uh, or these snaps, and I'm like, okay, but there's this problem.

We- whenever there's a snap that shows up in, say, Farcaster, there's- Mm-hmm ... uh, what's called a, a, a, um, a JFS, which is a, uh, Java Farcaster signature or something like that. And they do this kind of, like, very serious authentication, a very high level of trust to say, "Oh, yeah, yeah, this user can tap these buttons on this snap."

And it's way overblown. Like- Hmm ... you shouldn't need to know anything about me for me to hit the next button in a snap. Yeah. Right? And so I- I see. It's, it's a very baseline for everything, basically. Yeah. Yeah. At the high, high level. So they, they just went to the top and said, "Nope, you know, you, you need to be, you know, completely authenticated with signer privileges to do a post."

And 'cause that post could be casting, or it could be token transfer. It could be whatever, right? So they didn't, they didn't take those actions that are on a snap and parse them out to different types, like low risk, medium, and high. They just said, "They're all one thing, and you gotta have a signer to use it, or a JFS.

Not a signer, a JFS. Yeah. Um, so what, what you had done, intentionally or not, was, uh, the, you had an API route and then, like, a web route, and your web route is just saying, "Ah, screw that signer shit. Just, you know, is f- for- forget that." Yeah. And that's kinda cool, but, but you're hosting that snap. And then there's this thing like compose cast essentially.

Um, so there's four methods- Or, or using the API to, like, build the thing. Um, so I- Like, I, when you- Okay, so when I look at your repo- When you use the API route to build that, where did you see those? Yeah, yeah. Okay. So when I look at your repo... Oh, I gotta find one. Um, am I logged in? Where's mine? My snaps. My snap.

Uh, view. When I view my snap, I can see- By the way, I want to show you- Okay ... uh, oh. Okay. There we go. Maybe I wasn't sharing it before. But, um, I basically- Oh, there we go ... shared with it your, the ChatGPT query. I basically copied and pasted the whole thing and said sy- synthesize this. And then it was saying, I was saying this stuff, so I was like, no, like, let's give some credit to that.

No, no, it was K Mac. No, I know, I know. But, like, I also don't want it to, like, not know my information. And then, you know, the beauty of this here is it's a saved wa- and the first thing was want me to pull recent casts for context on this thinking, and I was like, "Fuck it, bet." Like, let's- Yeah ... let's go with that.

So that's where we're going at with it right now, so yeah. I think, uh- Very cool ... boom. W- w- what'd you just say right there? So- Yeah. Oh, I can barely see it. I'm so blind. Oh, yeah. Let me see if I can like- Pushing, pushing pip to relax. Yeah, yeah, yeah. Yeah, yeah, yeah. Um- So to relax your DFS signing requirements.

That, that's exactly... And Cassie chimed in, 'cause I was talking to N- whenever I'm, I'm like slightly passive aggressive, I talk to Nainar in public, like- Yeah ... 'cause I know Reece reads every one of those. So I'm like asking these questions. I'm like, "Ah, this seems kind of strict." And Cassie chimes in and is like, "Yes, pretty much this is ridiculous."

Like it's, it's very locked down right now. But your lank online has the ability to view these snaps and interact with them. Like the code is actually saying, "Hey, if I'm in web view, not... If I'm not in the context of a client, uh, soften these requirements on the signature." Uh, I don't know if you, if you knew that was there or not, but it's really pretty awesome.

That's cool. So- I did not know. I was like, "Oh." So yeah. Yeah, yeah. Okay. So if So this is where I was like, "Oh, you're doing something that I've like..." This, I was gonna have to go do this, but you already did it. Perfect. Um- Well, that's why I love open source code, right? Like I am a very... So I'm young and like, hopefully I like idealistic and like, uh, we can make the world a little bit better.

Ah, the world will take care of you. I used to be- You'll, you'll get jaded eventually. It, well, I used to be way more jaded before, which is the wild part. Um, but essentially, um, my thought now is I'm essentially building a community layer of, um, a bunch of different people in our community, and I wanna create something where I'm just creating a ton of different primitives all over that other people can eventually like come in and see and maybe be like, "Oh, like I could build on top of that."

Like or, "I can clone this and like build this out." So like I'm just trying to like make all of my ideas synthesized as quickly as possible to at least a draft and like that's the goal for me right now. Totally. 'Cause I have a lot of things that I haven't ever been able to like get to the resource pipeline through, right?

And like now is the best time to be able to do things like that. I know. It's, it's crazy. Uh, and- And I have the distribution mechanism, which is Farcaster, which is amazing. Like people don't realize how crazy it is. I've been making a client in the last few, like last month or so, because like it's... My synthesis of Farcaster and the, like beauty of it is any like user that's gonna use it as a social platform and network can like create their own front end for their community of how they want their community to interact with this protocol.

It could... Like my f- my like back, front end right now is literally like our four channels and then the trending feed from Sofa and that's it. Like we don't have like- Yeah ... any other tab. Yeah. Because like my goal- Totally ... is it's a community hub. It's like, like- Right. Yeah. Don't distract me with the noise.

This is what we care about. So yeah. So I'm, I'm really excited to- Let, let me ask you about that. The, the client that you're building, is it a full onboard of new users from out in the wild? No, not right now. Or you, you assume they have a Farcaster? Yeah. Well, you need a Farcaster- Okay ... to sign in right now, but at any point I could change that to a wallet.

But like- I'm, if I'm... I basically have it locked down to, uh, ZAO users, like people who have the ZAO governance token, and our governance token is illiquid and SOL bound. So you have to earn it every week. We have meetings that you can come in and participate in essentially, and people earn it over time.

And, uh, and that's our governance structure of the ZAO as a whole. So the goal is ultimately we, uh, incubate projects. Individuals that are part of the ZAO are just different community members with different projects affiliated with them, and they can kind of organize the social capital of different people having this governance token to build through ideas and form teams and s- of sweat equity with the chemistry and consistency of, like, having the resources from this, like, greater org and, like, all the, all the other things we're doing, right?

So- That's very cool ... that is, like, what I normally use for my, like, reference for a lot of things essentially. I'm just like, "Hey, what do you guys think?" Very cool. Well, that's a poll too. So- Yeah. But- Um, so as it relates... I think the, the original kind of spark on the connection in the DMs was I was like, "I think there's an ad network to be had here."

That was the framing, whether or not that's the right one. Yeah. But really my, my thinking was there's a way to use these snaps, which your tool authors quite nicely, and put them out in the wild so people can embed them on websites, and then progressively onboard people that are interacting with those- Mm.

Mm ... on, like, a WordPress site- Well, so you- ... or on a whatever ... so you... Yeah, yeah, yeah, yeah. So you just have a poll. We can send it to a Twitch chat, right? Like, so we've- Yeah ... been basically, me and one of my community members, have been diving really deep into Twitch because he's really like... Well, we both had a, a...

the person that onboarded us, this musician, to his community, transitioned to being a Twitch streamer and moving his community over there and, like, going Web2, and we've been seeing a lot of growth. And we hate... Like, there's a lot of, uh, bad content out there as well, so we're trying to, like, create, like, very more on the educational side, especially around crypto.

He's doing it every day. I'm way more interspersed, like, trying to bring in, like, different people to interview and different things. Um, but I was seeing, like, a lot of growth in the potential of, like, having these people s- young... People that watch Twitch and, like, pay attention on Twitch are young enough to want to do crypto but have just heard bad things.

That's it. Yeah. Like, you just have to- Yep ... educate them correctly. They're so willing to spend the money. Like, that's not an issue, right? Like, internet money is not a foreign concept to them. It... and it's the right people. It's just, like, stuff like this would be great ways to onboard them. So yeah, no, I like that.

So you have, like, a basic poll and then it's like, "Okay, hey, if you wanna, like, get some free, like, crypto, like, come make a farcaster and get some." Yeah. You- "Come build a..." You actually tap on, tap on the snap and it opens a QR code. Yeah. Right? Well, no. And- I'm saying, like, it's more of a, like- You, anyone could claim it, but you, like you claim it on Farcaster because you're claiming it as a Farcaster user, right?

Yes, exactly. But it goes through Wallet. So it becomes this onboarding path to- Exactly ... to get somebody in. And there's an incentive to do that now thanks to the Hypersnap stuff. So any app that onboards earns more rewards. That's actually probably the most rewards. I didn't know that. And then it's, then it's any users of an app that uses Hypersnap, that is also an incentive.

Now, these are all Snaps, and how much are Snaps worth, and will they be worth anything? Who knows. But there's at least this kind of call option of like, huh, we can all align towards trying to grow this, grow this where the engagement is actually authentic, 'cause it's got a pretty significant, uh, kind of spam filter.

Um, so anyway, I, I started thinking, "Okay, well, how do you get more users?" Well, you get out of this, like, walled garden that we're in, and you put our stuff out in the web and out in other places and other social contexts. Um, and how can you do that? Snaps are super close to being able to do that. And your, your builder, I was like, "Oh, look at this.

It's a website and there's, like, partial interaction of these Snaps. This is almost there." Um- Cool. So- Yeah, no, we can easily build it out. Like, I had, before, uh, actually winning the thing, 'cause, like, I was just, like, again, not really expecting much with it. But now that you're telling me all this, it makes a lot more sense actually, um, because it was actually well engineered.

And it's just, like, over time, like, improving the prompts. Like, that's the biggest thing that, like, I've been focused on, um, personally, and, like, how can I teach my musicians and other artists to be able to do those things as well? Um, but, uh, yeah, no, I hadn't th- thought much of, like, okay, like, this isn't bad.

There's, like, things we could do here and bring back, 'cause, like, I've al- I've always wanted to bring in some of, like, the partner brands like Empire Builder and, like, create templated things that are, like, very geared towards- Mm-hmm ... like, different brands that are in, out in there in the ecosystem, right?

Like, different projects of many different types where, like, there's so many easy ways to play around with them, especially if we have something that, like, collective people are going to and, like, adding suggestions and, like, bringing things in. So yeah, no, I think there's a lot of ways we can rock and roll with it.

L- let me, let me ask you this. This is, this one I haven't quite, quite solidified in my mind, but I, I know that this will happen. I just don't know what it'll look like. Um, we have ad networks for people, right? Like, we put up banner ads, we put up text ads, you know, all sorts of ads. Ads, ads, ads. What's that gonna look like in the agen- agentic world, in, like, an agent-to-agent kind of autonomous world?

So, y- okay, if you want my, my opinion of how- Yeah, yeah ... an ad should be. So, like, the, I don't, I think we're, I think somewhat even just saying the word ad is thinking about it wrong. Um, my goal- It is. And I, I need a way to frame it ... yeah, yeah, yeah. So, what I wanna do and what I'm creating is cultivating a community of culture where people want to be there, a, but also there is an underlying incentive of, like, giving the creators within the brand the opportunity to make money through the brand, right?

Like, by saying, like, everything that, like, um, Influence had done, right? Like, I don't know who it was was saying that was like- Yeah. Yeah ... influencer spam in the, in the chat, which I thought was hilarious 'cause, like, semi yes, but also, like, it was honestly one of the best ones I've seen- Yeah, yeah ... there. Also, like, I'd much rather, like, personally get, like, give money in an ad to, like, if I know it's going, like, right to that individual, right?

Like, I think there's a lot more benefit of, like, that peer-to-peer benefit. But, like, the thing that- Bring that out to the web now. That is exactly that- But it's who you- ... but everywhere ... want. You want the people that know your brand the most, that for, like, the life in them would want to represent your brand anyways.

Like, you bring out the Clippers, you bring out the, like, the people that, like, in your community are the most devoted people, and you make those your advertisers, right? Like- Mm-hmm ... that's the people think, people are missing. Like, everyone, for me, I, I think, like, everyone always thinks in web two, right? Like, we gotta go and get a ad agency.

Mm-hmm. A group of people to help us outside of our brand, right? And the challenge there is they do that for a living. So, like, from brand to brand, they don't see, like, what's special about this and this ecosystem necessarily. They're just making a generic brand that, ad that works for everything, right?

Exactly. We'll get you reach. We'll find you. Exactly, right? Yeah. And I think the best people for your brand is always gonna be the people within your community, the people that, like, believe in you the most, because they'll wanna do it for free. So now if you give them money to do it, they'll do a much better job at making that effort.

And you can, like, my goal has always been how do we filter out bad, bad influences, right? Yeah. So, like, that's why I created the respect game. Well, I didn't create the respect game. That's why I started leveraging the respect game in our, um, organization and started using it to collectively collect, uh- I'm not sure I'm familiar with it.

What, what is it? Okay. Sorry, yes. I forgot. I just jumped on a call before and, uh, and I was talking about it. That's why. Um- Essentially, we meet weekly, um, to, to distribute out this token. Um, uh, and in groups of six, people share what they've done in the last week to for- progress the ecosystem forward, which is anything in advancing tech and art.

Um, and in that group of six people, we'll reach consensus on who's done the most, the second most, the third most, the fourth most, the fifth most, the sixth most, then everyone gets a certain amount of distribution of the token that's, again, SOL-bound illiquid. You can only earn it through participating in the weekly meetings by sharing, knowledge sharing essentially on what you're working on to help everyone, right?

The collective. Um, and people get, uh, based on... It's a Fibonacci sequence, so like the higher ranks actually get a significant amount more. So it's like it really is supposed to be once you have, like, 36-plus people, you can actually bring the top people of every single group into another fractal of six, right?

Because you have 36 of you. Mm-hmm. So the concept is being able to actually scale up to, like, a big whatever number because you have created fractal groups of, like, it can grow to any amount and it's still kind of like it doesn't matter if it's one, it doesn't matter if it's 100, it's still done the same.

Mm-hmm. I see. Interesting. So that's what we've done, and w- this, we just had on Monday our 99th week. This upcoming one's gonna be our 100th. And, um, we started learning that from a different community, a different group, Eden, Eden Fractal and Optimism Fractal, and like really kind of perfected the concept.

So, like, I just kind of jumped on board with, like, my artist group and, like, been like, "This is amazing. We're gonna do it. I'm gonna use this as my thing." Mm-hmm. And, um, and that's it. Give me the name of it again or what is it? It's called ZAO. Send me the notes when we're done. Send me the notes when we're done.

Yeah, yeah, yeah. Um, yeah, I think, um, I, I, all you'd have to do I think is share it with your email. Um, what I was gonna say was, let me just... Oh, oh yeah, I'll just share it with you after, and then I'll remember. Yeah. But yeah. So that's kind of what we've done. ZAO Fractal is ours. Mm-hmm. Optimism Fractal is what I joined at first, which was specifically geared towards the Optimism blockchain, like things you are doing to forward the Optimism ecosystem.

Not like by Optimism itself, like there were a couple grants that they got and stuff. Mm-hmm. But just like th- this alt group that, like, had, uh, been a part of Eden Fractal, which was the cultivation of fractals as a whole, which had previously been Fractalian, previously had been on EOS. Mm-hmm. I don't know.

Um- Yeah ... so I'm not part of that, any of that. I just joined at the very end, the last stem, and I'm the, like, new stem essentially. Um, so yeah. It's beautiful to have- Divergence, man. Divergence is the way ... it's, it's, it's amazing to have people upstream from you to help give that, like, support in specific ways as well.

So yeah. Very cool. So that's what the fractal game is. Got it. Got it, got it ... I, that I'm able to, like, have a trust network of, like, our whales are people that over time have been supporting as opposed to, like, people with the most money. Yeah. I, and I don't remember Influence exactly, but I was- So Influence was like peer-to-peer, like, you essentially, um, as a user, a lot of the users were, like, more of the AI spam users that were, like, farmers of course, 'cause you were essentially- Yeah

getting free money for either recasting or liking a post, and you just put up an ad, a $5 budget minimum. Was, was this the one that, uh- It was the orange one ... okay. So, so I would, I would cast and say, "Hey, here's $5," or, "I'll pay a penny- And you could block- ... to whoever recasts it," and people would go recast it for that one?

Well, yeah, and it's like you can do a multiplier, but, like, I don't know why you would ever not just do a 1X. I've always, uh, so, like, at the smallest cent. Yeah. And it gives out, like, anywhere between seven to 70 cents to a person based on their mind shares. Like, that was their whole big thing. Oh, oh, that was it.

That was the scoring one. Right, right, right. So I do think that that- They had the heat map of- ... wasn't bad, but I also don't think it was the best it could be. Yeah, yeah. And did the, the advertiser in that case, the one that put up the money, did they get to choose who it was? Like, it's gotta be a mutual follow or something like that?

Um, mind share, you mean? Or was it just... Yeah, in Influence. Um- Oh, oh, oh. Oh, no, I don't think so. I don't think there was any, like, action. There was no filtering out. Yeah, yeah. I mean, there might've been an ANR score one maybe. I don't know. Like- Right ... maybe not. I, I, I'm not too sure that specifics, to be honest with you.

Okay. I did a- Yeah, I, I'm fascinated by that whole space. I did an interview- And Amp's kind of kicked it off. Yeah, I did an interview with Ali, actually. I can send it over to you as well after. Yeah, very cool. Very cool. Um, yeah, I think there's something super powerful that just hasn't quite, quite clicked, and part of it is that Farcaster is so small.

Uh, it's kind of like all circle jerk around and, like- Yeah ... "Oh, we're promoting each other's," and, you know. Where if we get out into the world and it's like, "Hey, I've got this ad up there," and as you were saying, only the true fans, only the ones I as an advertiser follow back, right? Like, there's a mutual.

Those are the only ones that can earn from amplification. Um, so, like, I, I, part of it, I think this is all really, all the tools are right there. Like, it's, it's all on Hub. It's all in these feeds. We can use channels. There's this new thing landing from, uh, Hypersnap. It's called... What is it called? Uh, GraphQL.

So you can now create these, like, these queries- that are, you know, between the queries and the web hooks, you just kind of listen for things that happen based on a certain set of rules. Uh, so I'm like, oh, that could be the way to filter this stuff. Like, only, only show the amps from these people. Yeah. Um, anyway, I think there's just a really ripe set of stuff there, and with this token out there now pretty widely distributed, I'm like, hey, might be worth trying to see if there are a bunch of people wanna get together and, and try to, try to create something.

I wanna learn more about the data behind it. That's what I want. Say that again. I said I wanna learn more about the data behind it. Um, Cassie said about catching a bunch of symbol rings. I'm not gonna lie to you, there's so many messages in the chat, I have not kept up with all of them. Yeah, yeah. So that's what I'd also love to chat with you more about of like- Sure

letting me know important information on, based on that, because it's so hard to keep up. I was during, like, a good period, and just, like, in the last week, it's like- Are you kidding? ... it's so much, I'm falling behind. It's all a trade-off. You can't stay on it at all. But I, I definitely had a front row seat for w- it was, uh, was it M- MVR something with an M.

Mon- Mon- Yeah, MVR is, yeah, yeah, yeah. Mon- uh, Mont- Monte- They just made so many pools. Monteco. Monte- Yeah. Yeah. There was, like, four people that were just diving into this data, and I'm just like, "Oh my God." And then they- Yeah ... they... I mean, the size of these rings were just massive. Massive. Like, how many accounts?

Like, what do you mean by that? Oh. Um, there is a spreadsheet out there, but if I said a million, I don't think I'd be off. Damn.

And then there was, like... So, so then it was like, okay, that was the four passes- That's wild ... I think. And then, then so it was like, hey- So- ... there's, we're down to the last one, and, uh, we're like, okay, this is, this is pretty goo- pretty good. We put it out there, you know, everyone gets the rewards, and then you can see based on the claims, like, if they were all, like, funded from the same wallet.

Uh, so you'd be like, oh, we missed this 32 account ring. We missed this. There was one that... There was only two of significant value, and I say significant. They weren't, you know, single dollar amounts. They were, like, somebody got, like, a, I think, like, um, a single t- uh, not dollars. This is wrong. Uh, snaps. Um, somebody got, like, 1,100 snaps.

That was, like, the biggest one we missed. But then Cassie's like, "Well, now we know where they are," so she updated the algorithm so they don't get it going forward. Yeah. Um, and that was super interesting. There is a spreadsheet out there. It was posted in- And there was- ... a group chat ... recently a fair distribution, right?

Yeah. It, it, so it was one of those things where- And for me, it's now getting a little simpler ... there was a group of us that were like, "Let's not hunt anybody," because there was one or two names on there that were recognizable. Yeah. Yeah, I mean, I wrote Cody at the top. I don't know if that was like- Okay.

Yeah, you got it. All right. I didn't want to say it. Yeah. Well, the, i- okay. Well, like, I know we're on recording, but there's a problem with the, like, Yellow collective, where, like, he has this prop out that, like, apparently... So, so the only one dude is, like, hounding him over it, but he basically got, like, $11,000 to do, like, eight episodes.

It's not even that difficult of a thing, but I think there's someone else that's involved, Jack Wilds, that's, like, mm, more AFK now, so I think that is the challenge, and I get that. But he's basically just not being accountable in this group chat. Basically, it's been going on for months, 'cause I joined, like, Yellow, like, six months ago.

Yeah. So it's like... Yeah, so I, yeah. Okay. That, 'cause, like, that's what I thought I read when I was reading the list. Yep, you nailed it. I was like, "Try to figure it out." You nailed it. It- Yeah ... yeah, it, uh- I mean, it was at the top. It was... Yeah. But I, I was super impressed that out of, you know, what was, I, I think millions of, uh, of accounts and, and that were, that were caught in the net, only really two of kind of like, "Oh, that's real money," you know?

Yeah. Like the were kinda seeped through and then they, you know, swept up at the end. So I'm like, "Oh, this is gonna be a pretty good spam filter-" Yeah ... until the next round. Well, well that's- Then someone will game it- And then- ... and then we'll catch up and- Well, so you guys, and then how much do you know about the Intori homie, DB?

Oh. No, I don't. He's dope. He, like, @DB, he's creating Intori, I- S-C-I-S. Let me see if I can pull it up. Oh, In- hold on. Yeah, let me, let me see. I-N-T-O-R-I. Oh, yeah. I-N... Hold on. Let's get over there. I-N-D-O... In- Intori, T-O. O-T-O. Yeah. Right, right, I've seen this. Um...

I'll send you a link here. This is why I'm, like, partnering with him as well and doing some stuff. He's getting a crazy amount of good data as well on users, um- Yeah ... and just, like, how people interact f- specifically farcaster and, like, leveraging, like, the fact that we are doing these things publicly on the internet, but there's no, like, also accountable way to, like, level, like, okay, contributions.

Like, especially, like, real ones. And, like, my goal is a peer-to-peer system. Like, that's what I'm creating, of course. Yeah, yeah. There is huge levels like this where, like, I wanna work with you guys as well, like, you guys being, like, all these other big, like, people who have a enormous amount of data on everyone, right?

So it's like, I can also level set, like, additional- Oh, yeah ... like, layers of authentication based on other people's data of users, right? And I think something like that- Yeah ... is super valuable. Oh, is Intori putting this stuff on, uh- Let's call it on node. Um, like you take these quizzes and you give all this kind of like preference information.

I don't know. I don't know. So this is the part that bothers me a little bit. Like, u- unless there's some incentive that's shared out with the community, like, it's kind of farming preferences. It's, it's the same, same thing in web as web, Web2 did, but now it's just in Web3. You know, it's like, "Oh yeah, Facebook knows everything about my preferences.

Uh, oh, and Tory now knows everything about my preferences." Great. But I think it's different when it's things that you're posting online and like, I don't know, I think like in this age of AI, it's gonna be absolutely insane. But also, like, again, I'm, uh- Yeah ... but I think they're doing stuff with privacy. But- Like their focus is like keeping, giving you as a user- Discover your people

as much of the info and like keeping that private- Yeah ... and secure. Right. But, uh- But again- Who, who else was it doing it? There was somebody in New York, uh, oh, they were taking a much more of almost like a LinkedIn approach. Um, do you remember this, uh, Jack... Was it Jack? Oh. Oh, what was it called? I can't remember.

Uh, Interface maybe. No, not Interface app. Um, uh, but it was more, it was, it was very much a, uh, attesting to your so-and-so has skills and, and such. Uh, and I was like, "Oh, that, that's pretty neat." And now that was all, uh, EN- or EAS, uh, Ethereum Attestation Service, so you could, anyone could go query that stuff.

It was all kind of public and open. These quizzes that are kind of like, okay, you, you wanna know I like pepperoni pizza. I'm like, "Uh, why?" Like I'm st- I'm not there yet. What's, what's in this for me? That's valid. So, but, uh, yeah, and Tory, I, I remember seeing this going, oh, there, there's something here, but I don't know what it was, and I kind of moved on.

But you want the data for, for what? To try to build more communities based on the affinities? Is that your, your jam? No, more to like get like the... Like we have our personal community, like filter basically. I wanna be able to also have other people's filters that anyone in my community can turn on and off to like see different like people on different filters, right?

Like if that was the case or like all of them, right? Mm-hmm. So like AI slot filter, that's what Shaw, Shaw Makes Magic said at ETH Boulder, and I really en- liked that terminology. Trying to create the best thing that you can do for that, for your people. Right. Yeah. Yeah, yeah.

Got it. What is this acronym? S- S-C-I-S. Did he explain what that is? It says it up there I think, right? It does, it do- I, I can barely read. You kidding me? Uh, how to turn over time. This p- introducing. This, this powers more. I'm like, I need the S equal, SE equal, I equal. Have I just... Yeah. So it's signal something, right?

Stru- oh, structured con- conversational inventory system. Okay, got it. Now it makes sense. Why we built this, I don't know.

Oh, I see. I see, I see. Oh, that is pretty cool.

Yeah. Let's see. Is the data open? Yeah, very cool. Very, very cool. So you have a pod coming up by like a spin, spinning up? Yeah. What, what's, uh- You know, in 15 minutes- You do it every day? You do it weekly? What do you do? Uh, this one's weekly on Wednesdays. Um, I also do the one... I also do interviews like on my own.

This one's with three other people co-hosting with me and we interview one person. Give me, give me the name of it. I'm gonna get it in my playlist here. It's called... Well, it's not on like the regular platforms right now. Oh. We actually put it on Uh, One- YouTube. Okay. All right. Yeah, yeah, yeah. No, no, no. Like, yeah, no, no.

Not like fancy podcast. I'm, I'm just getting content out there for, for the community. Um, but- Got it ... but, like, um, my goal is, I've recently been doing more towards that, but, um, I'm also doing it with my personal one and that... So this one's called Let's Talk About Ethereum. It's l- evolved from Let's Talk About Web3, which had started with me and my homie in, uh, spaces, and then we evolved it to live streams.

Um, so we did three seasons of that, and then we did, started Let's Talk About Ethereum this year as an evolution of that with another co-host. And, uh, and then I also have my own Better Calls All Yaps, essentially that I just do as like- Very cool ... whenever I can get people. So yeah, that one's bczyaps.com, but I'm trying to do a similar thing to this one with Let's Talk About Ethereum, where like all the transcripts are there.

Like you get all the details about all the past things and like really leveling up like a simple brand page that you could do in the past, but like actually giving like agents good access to, to the information as well. Very cool. Very cool. Um, so with your, um, oh, it was Lank Online? Yeah. Kind of the ad network thing.

Is it something that you wanna continue to riff on and just kind of float in and out of and- Yeah, yeah, yeah. I already started- ... see what happens? Something like that? I started building upon it like, uh, I'm gonna probably pop- Most of this through as well, um- See what it says ... from start. Yeah, yeah. And then, then we'll just go from there, 'cause like I, I already said- Like it

my first thing I wanted to do anyways with this, and I hadn't come back to building on it since, uh, since I had submitted it. Well, a little bit after I'd submitted it, 'cause like I was still working on, on that Sunday and Monday to like finish a couple last things that I really wanted off. Um, but essentially, uh, I had been wanting to for a while, like add in things specifically towards like Empire Builder and like actually play around with it more, um, with a couple other of the basic mini apps that are out there.

So yeah, I'm, um, I'm excited to see what we can do with it. Um, ads, like I, I need people, I need like actual ad space anyway. Like, the fact that we would have, be creating the ads and the ad space and all this and being like involved in that, I'm super about, 'cause like I wanna learn more about it. Yeah, yeah.

'Cause like I really like barely know about like even if I wanted to do Web2 ads, Web2 ads, but like I don't have, I don't want to spend my money there anyways. So. Yeah, yeah, yeah. Totally. Totally. And then, and- So I feel like creating something that could be really valuable is like very easily valuable could be really cool.

So yeah, I think it, like it'd be really cool if you could create like simple snaps that like let people dive deeper into the context of that individual and that individual post, and then create a comment based on that, or a quote reque- quote recast ideally. Mm-hmm. You know? So yeah. Yeah. So the thing that I'm trying to, um, kinda at least get to a point of hardening, which is not there yet, is, uh, a little snippet, or you can think of it as an SDK, but it's really just a JavaScript snippet.

Kinda like dropping Google Analytics on your site. You know? Just like, "Put this in your header." Yeah. And it's got your little ID. So you'd put that onto a website, and then that would then, you know, and then say, "Where do you want this snap to show up on your website?" Kinda like, "Where do you want an ad to show up?

Is it the banner? Is it in the right nav?" The whatever. So once you've got that kinda tag, then it just kind of automatically populates based on a channel. Yeah, like just like an embed. Like, like in Game Over- Exactly like that. Yeah. Um, but in, in, uh, and this is where I'm gonna like hit some of the snaps that you've created, because they show up in a web and you can click some buttons, actually do something.

Um, so I'm gonna see if that works as kind of a next step. 'Cause I got stuck using main R hosted, and the, the protocol says you can't, uh, touch the buttons without a signature. So every time someone touches the button it goes back to the host instead of the- Oh, I kinda, I usually I just use hats for that.

Use hats, what is it? Yeah, H-A-A-T-Z. It's one of the things that Cassie created. Oh, yeah, yeah. This is Cassie's thing. Yeah, yeah, yeah. Yeah. But, but, but here's the issue. Um, it's the snap- I think- ... it's the snap protocol That says, oh, when you build your Snap, you have to make this JSON object that has these fields in it, and every time you get a post request on your server, you have to verify a signature so you know who sent this post request.

And it's that verify that fails. Your website does not because it's filtering. It's saying, "Hey, I'm on the web. I don't have this signature." So there's something, like, clever there that is necessary that, uh... So I'm gonna see if I can get some of your Snaps to show up in this little, this little widget, this little embed, uh, as kind of my next step, um, in my- Awesome

reading these. So, yeah. My closest homie. Yeah. So I'll hop off with you and then text me. Yeah, yeah. Just shoot me a message. Way cool. I'm always around. You got it, man. Cheers. All right. Later.
