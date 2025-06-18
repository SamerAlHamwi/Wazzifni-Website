
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'dart:html' as html;



class LanguageSwitcher extends StatefulWidget {
  const LanguageSwitcher({super.key});

  @override
  State<LanguageSwitcher> createState() => _LanguageSwitcherState();
}

class _LanguageSwitcherState extends State<LanguageSwitcher> {
  String _currentLang = 'AR';

  final Map<String, String> _languages = {
    'AR': 'العربية',
    'EN': 'English',
  };

  void _switchLanguage(String langCode) {
    setState(() {
      _currentLang = langCode;
    });

    context.setLocale(Locale(langCode.toLowerCase())).then((_) {
      // Reload the web page to apply the new locale
      html.window.location.reload();
    });
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((c){
      getCurrentLanguage();
    });
  }

  getCurrentLanguage(){
    final currentLocale = context.locale.languageCode.toUpperCase();
    if (_languages.containsKey(currentLocale)) {
      setState(() {
        _currentLang = currentLocale;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      onSelected: _switchLanguage,
      itemBuilder: (context) => _languages.entries.map((entry) {
        return PopupMenuItem(
          value: entry.key,
          child: Text(entry.value),
        );
      }).toList(),
      child: Row(
        children: [
          const Icon(Icons.language, color: Colors.black87),
          const SizedBox(width: 6),
          Text(
            _currentLang,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const Icon(Icons.keyboard_arrow_down),
        ],
      ),
    );
  }


}


