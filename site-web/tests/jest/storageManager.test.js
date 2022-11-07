import songs from "../../src/assets/js/songs";
import playlists from "../../src/assets/js/playlists";
import StorageManager from "../../src/assets/js/storageManager.js";

describe("StorageManager tests", () => {
  const assignMock = jest.fn();
  const clearHTML = () => (document.body.innerHTML = "");
  let storageManager;

  const setUpHTML = () => {};

  beforeEach(() => {
    delete window.location;
    window.location = { assign: assignMock };
    setUpHTML();
    storageManager = new StorageManager();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assignMock.mockClear();
    clearHTML();
    localStorage.clear();
  });

  it("Storage manager should be created", () => {
    expect(storageManager).not.toEqual(null);
  });

  it("loadAllData should correctly call loadDataFromFile for both files", () => {
    const storageManagerLoadDataFromFileSpy = jest.spyOn(storageManager, 'loadDataFromFile').mockImplementation(() => {});
    storageManager.loadAllData();
    expect(storageManagerLoadDataFromFileSpy).toHaveBeenCalledTimes(2);
    const expectedStorageKeySong = "songs";
    const expectedStorageKeyPlaylists = "playlist";
    expect(storageManagerLoadDataFromFileSpy).toHaveBeenCalledWith(expectedStorageKeySong, songs);
    expect(storageManagerLoadDataFromFileSpy).toHaveBeenCalledWith(expectedStorageKeyPlaylists, playlists);
  });

  it("loadDataFromFile should not reload data if data is already contained in localStorage", () => {
    const defaultKey = "key";
    localStorage.setItem(defaultKey, JSON.stringify(defaultKey));
    const localStorageGetItemSpy = jest.spyOn(localStorage.__proto__, 'getItem');
    const localStorageSetItemSpy = jest.spyOn(localStorage.__proto__, 'setItem');
    storageManager.loadDataFromFile(defaultKey);
    expect(JSON.parse(localStorage.getItem(defaultKey))).toEqual(defaultKey);
    expect(localStorageGetItemSpy).toBeCalled();
    expect(localStorageGetItemSpy).toHaveBeenCalledWith(defaultKey);
    expect(localStorageSetItemSpy).not.toBeCalled();
  });

  it("loadDataFromFile should load data if data is not already contained in localStorage", () => {
    const defaultKey = "key";
    const data = JSON.stringify(defaultKey);
    const localStorageGetItemSpy = jest.spyOn(localStorage.__proto__, 'getItem');
    const localStorageSetItemSpy = jest.spyOn(localStorage.__proto__, 'setItem');
    storageManager.loadDataFromFile(defaultKey, data);
    expect(JSON.parse(localStorage.getItem(defaultKey))).toEqual(data);
    expect(localStorageGetItemSpy).toBeCalled();
    expect(localStorageGetItemSpy).toHaveBeenCalledWith(defaultKey);
    expect(localStorageSetItemSpy).toBeCalled();
  });

  it("getData should not get localStorage's data given an invalid storageKey", () => {
    expect(storageManager.getData(undefined)).toBeFalsy();
  });

  it("getData should get localStorage's data given a valid storageKey", () => {
    const defaultKey = "key";
    localStorage.setItem(defaultKey, JSON.stringify(defaultKey));

    expect(storageManager.getData(defaultKey)).toBeTruthy();
    expect(storageManager.getData(defaultKey)).toEqual(defaultKey);
  });

  it("getItemById should call getData", () => {
    const defaultKey = "key";
    const storageManagerGetDataSpy = jest.spyOn(storageManager, 'getData').mockImplementation(() => []);
    storageManager.getItemById(defaultKey, undefined);
    expect(storageManagerGetDataSpy).toBeCalled();
    expect(storageManagerGetDataSpy).toHaveBeenCalledWith(defaultKey);
  });

  it("getItemById should find item with specific id", () => {
    const defaultKey = "key";
    const dataTest = { id: 0, name: "test" };
    jest.spyOn(storageManager, "getData").mockImplementation(() => [dataTest]);
    expect(storageManager.getItemById(defaultKey, 0)).toEqual(dataTest);
    expect(storageManager.getItemById(defaultKey, 1)).toEqual(undefined);
  });

  it("addItem should correctly add an item to localStorage", () => {
    const storageKey = null;
    const newItem = undefined;
    const localStorageGetItemSpy = jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(() => JSON.stringify([{ newItem }]));
    const localStorageSetItemSpy = jest.spyOn(localStorage.__proto__, 'setItem').mockImplementation(() => {});
    storageManager.addItem(storageKey, newItem);
    expect(localStorageGetItemSpy).toBeCalled();
    expect(localStorageGetItemSpy).toHaveBeenCalledWith(storageKey);
    expect(localStorageSetItemSpy).toBeCalled();
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(storageKey, JSON.stringify([{ newItem }, storageKey]));
  });

  it("replaceItem should correctly replace an item in localStorage with id checks", () => {
    const defaultKey = "key";
    const item = { id: 0, name: "item" };
    const newItem = { id: 0, name: "New item" };
    localStorage.setItem(defaultKey, JSON.stringify([item]));
    expect(JSON.parse(localStorage.getItem(defaultKey))).toEqual([item]);
    expect(storageManager.getItemById(defaultKey, 0)).toEqual(item);
    storageManager.replaceItem(defaultKey, newItem);
    expect(JSON.parse(localStorage.getItem(defaultKey))).toEqual([newItem]);
    expect(storageManager.getItemById(defaultKey, 0)).toEqual(newItem);
  });

  it("replaceItem should call getItem & setItem", () => {
    const storageKey = null;
    const newItem = undefined;
    const localStorageGetItemSpy = jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(() => JSON.stringify([]));
    const localStorageSetItemSpy = jest.spyOn(localStorage.__proto__, 'setItem').mockImplementation(() => {});
    storageManager.replaceItem(storageKey, newItem);
    expect(localStorageGetItemSpy).toBeCalled();
    expect(localStorageSetItemSpy).toBeCalled();
  });

  it("getIdFromName should call getData", () => {
    const defaultKey = "key";
    const storageManagerGetDataSpy = jest.spyOn(storageManager, 'getData').mockImplementation(() => []);
    storageManager.getIdFromName(defaultKey, undefined);
    expect(storageManagerGetDataSpy).toBeCalled();
    expect(storageManagerGetDataSpy).toHaveBeenCalledWith(defaultKey);
  });

  it("getIdFromName should return a valid id given a valid elementName", () => {
    const elementName = "elementName";
    const expectedId = 0;
    jest.spyOn(storageManager, 'getData').mockImplementation(() => [{ name: elementName, id: expectedId }]);
    expect(storageManager.getIdFromName("key", elementName)).toEqual(expectedId);
  });

  it("getIdFromName should return -1 given an invalid elementName", () => {
    const elementName = "elementName";
    const expectedId = 0;
    const invalidName = "invalidName";
    jest.spyOn(storageManager, 'getData').mockImplementation(() => [{ name: elementName, id: expectedId }]);
    expect(storageManager.getIdFromName("key", invalidName)).toEqual(-1);
  });

  it("resetAllData should reset localStorage", () => {
    const storageKey = "key";
    const data = { id: undefined };
    localStorage.setItem(storageKey, JSON.stringify(data));
    storageManager.resetAllData();
    const result = JSON.parse(localStorage.getItem(storageKey));
    expect(result).toEqual(null);
  });
});
