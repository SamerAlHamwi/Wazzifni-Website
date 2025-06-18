
import 'package:get_storage/get_storage.dart';


class SharedStorage {

  static String storageName = 'wazzifni-website';
  static GetStorage box = GetStorage(storageName);
  static String tokenKey = 'tokenKey';
  static String languageKey = 'languageKey';
  static String accessKey = 'accessKey';

  static init() async {
    await GetStorage.init(storageName);
  }

  static setAccess(bool access) {
    box.write(accessKey, access);
  }

  static getAccess() {
    return box.read(accessKey) ?? false;
  }

  static setLanguage(String language) {
    box.write(languageKey, language);
  }

  static getLanguage() {
    return box.read(languageKey) ?? 'ar';
  }

  static setToken(String token) {
    box.write(tokenKey, token);
  }

  static getToken() {
    return box.read(tokenKey) ?? '';
  }

  static hasToken() {
    if (getToken().isNotEmpty) {
      return true;
    }
    return false;
  }

  static logout() async {
    await box.erase();
  }
}


