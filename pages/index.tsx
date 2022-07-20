/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Head from 'next/head';
import React, { ChangeEvent, useState } from 'react';
import styles from '../styles/Home.module.css';

const buildUrl = (username: string, numOfItems: number, excludedItems: string[]) => {
  const apiRoute = '/api/users/';
  const queryParams: string[] = [];

  queryParams.push('format=svg');
  queryParams.push(`limit=${numOfItems}`);
  excludedItems.length > 0 && queryParams.push(`filter=${excludedItems.join(',')}`);

  return `${apiRoute}${username}?${queryParams.join('&')}`;
};

const Home: NextPage = () => {
  const [resultingUrl, setResultingUrl] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [numofItems, setNumOfItems] = useState(15);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);
  const [newExcludedItemText, setNewExcludedItemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    setGithubUsername(e.target.value);
  };

  const handleChangeNewExcludedItemText = (e: ChangeEvent<HTMLInputElement>) => {
    setNewExcludedItemText(e.target.value);
  };

  const handleIncrementItems = () => setNumOfItems((current) => current + 1);
  const handleDecrementItems = () => setNumOfItems((current) => Math.max(current - 1, 1));

  const addNewExcludedItem = () => {
    const trimmedTextValue = newExcludedItemText.trim();
    if (!trimmedTextValue || excludedItems.includes(trimmedTextValue)) return;

    setExcludedItems((current) => [...current, newExcludedItemText]);
    setNewExcludedItemText('');
  };

  const removeExcludedItem = (value: string) => () => {
    setExcludedItems((current) => current.filter((excludedItem) => excludedItem !== value));
  };

  const handleExcludeFieldKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewExcludedItem();
    }
  };

  const handleImageLoaded = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageLoadingError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newUrl = buildUrl(githubUsername, numofItems, excludedItems);
    if (newUrl === resultingUrl) return;

    setHasError(false);
    setIsLoading(true);
    setResultingUrl(newUrl);
  };

  const renderToolbelt = () => {
    if (!resultingUrl) return null;

    if (hasError)
      return <p className={styles.text}>unable to load image, check if parameters are correct</p>;

    return (
      <>
        <p className={styles.text}>
          {isLoading ? 'loading...' : 'here is the result, click to open embed url'}
        </p>
        <a href={resultingUrl} target="_blank" rel="noopener noreferrer">
          <img
            onLoad={handleImageLoaded}
            onError={handleImageLoadingError}
            src={resultingUrl}
            alt="list of node packages"
            width={'100%'}
          />
        </a>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Npm Toolbelt</title>
        <meta name="description" content="what are my most used node packages?" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.header_text}>npm toolbelt</h1>
          <p className={styles.header_subtext}>what are my most used node packages?</p>
        </header>

        <main className={styles.main}>
          <form
            onSubmit={handleSubmit}
            className={styles.toolbelt_form}
            onKeyUp={(e) => e.preventDefault()}
          >
            <label className={styles.flex_row}>
              <span className={styles.text}>github username:</span>
              <input
                type="text"
                name="username"
                className={styles.input}
                value={githubUsername}
                onChange={handleChangeUsername}
              />
            </label>
            <div className={styles.flex_row}>
              <span className={styles.text}>items:</span>
              <div className={styles.counter}>
                <button
                  type="button"
                  className={styles.btn_stripped}
                  onClick={handleDecrementItems}
                >
                  -
                </button>
                <span className={styles.text}>{numofItems}</span>
                <button
                  type="button"
                  className={styles.btn_stripped}
                  onClick={handleIncrementItems}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className={styles.flex_row}>
                <span className={styles.text}>exclude from result:</span>
                <input
                  type="text"
                  name="exclude"
                  onKeyDown={handleExcludeFieldKeyPress}
                  className={styles.input}
                  value={newExcludedItemText}
                  onChange={handleChangeNewExcludedItemText}
                />
              </label>
              <ul className={styles.excluded_list}>
                {excludedItems.map((excludedItem) => (
                  <li key={excludedItem}>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={removeExcludedItem(excludedItem)}
                    >
                      <span>{excludedItem}</span>
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" className={styles.btn} onClick={addNewExcludedItem}>
                    +
                  </button>
                </li>
              </ul>
            </div>
            <div className={styles.flex_row}>
              <button type="submit" className={[styles.btn, styles.btn_action].join(' ')}>
                <span className={styles.text}>get toolbelt</span>
              </button>
            </div>
          </form>
        </main>
        <footer className={styles.footer}>{renderToolbelt()}</footer>
      </div>
    </>
  );
};

export default Home;
