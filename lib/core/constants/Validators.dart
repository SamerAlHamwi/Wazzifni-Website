
import 'package:easy_localization/easy_localization.dart';

class Validators {
  static bool validateImage(String fileName) {
    if (fileName.toLowerCase().endsWith('png') ||
        fileName.toLowerCase().endsWith('jpeg') ||
        fileName.toLowerCase().endsWith('jpg')) {
      return true;
    } else {
      return false;
    }
  }

  static String? validateEmptyValue(String? value) {
    if (value == null || value.isEmpty) {
      return 'required'.tr();
    }
    return null;
  }

  static String? validateIntValue(String? value) {
    if (value == null || value.isEmpty) {
      return 'required'.tr();
    }

    if (int.tryParse(value) == null) {
      return 'invalid_value'.tr();
    }

    return null;
  }


  static String? validateDateValue(String? value) {
    if (value == null || value.isEmpty) {
      return 'wrong_date'.tr();
    }

    int? intValue = int.tryParse(value);

    if (intValue == null || intValue > DateTime.now().year) {
      return 'wrong_date'.tr();
    }

    return null;
  }


  static String? validatePhoneNumber(String? value) {
    if (value == null || value.isEmpty) {
      return 'required'.tr();
    }

    if (value.length != 10) {
      return "invalid_phone_number".tr();
    }

    return null;
  }

  static String? validateMaxValue(String? value, int number) {
    if (value == null || value.isEmpty) {
      return 'The text is empty'.tr();
    } else if (value.length > number) {
      return 'The text is too long'.tr();
    }
    return null;
  }

}
