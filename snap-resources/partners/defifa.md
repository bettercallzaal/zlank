# Defifa

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research - re-verify specifics)
**zlank block:** poll-based (no dedicated block) | **template:** `defifa-prediction-game`

## What it is

A decentralized prediction game. Originally NFT-based (the 2022 FIFA World Cup
flag game), now generalized. Players buy NFT positions ("flags"), vote on
scorecards, and claim from the treasury proportional to ranking. Built on
Juicebox treasuries.

## Who builds it

kmacb.eth co-founded Defifa alongside Jango (Juicebox co-founder). It is part of
the Juicebox / Revnet / Defifa cluster - see also the kmacb collaboration memory.

## Integration surface

- Site: https://defifa.net
- Built on Juicebox V2+ treasuries (https://juicebox.money)
- Ethereum-wallet based; no native Farcaster signer in the planning research.

## zlank `defifa-prediction-game` template - today vs should do

**Today:** a 2-page template built from existing `poll` + `navigate` + `header`
+ `share` blocks - a simple multi-round bracket pick. No Defifa onchain
integration; it is a "prediction game shaped like Defifa" using generic blocks.

**Should do:** if real Defifa integration is wanted, a dedicated block would
need the Defifa game contract interface - buy a flag / position, submit a
scorecard vote, claim. That is a deeper build; the poll-based template is the
honest v1.

## To verify

- The Defifa game contract interface (create game, buy position, vote, claim).
- Whether Defifa has any Farcaster-native surface or it is web-app only.
- Current state of Defifa in 2026 - the planning research was light here.

## Sources

- https://defifa.net
- planning research (kmacb stack pass, 2026-05-13)
