

import 'package:flutter/material.dart';
import 'package:wazzifni_website/features/home/ui/widgets/about_company_section.dart';
import 'package:wazzifni_website/features/home/ui/widgets/about_section.dart';
import 'package:wazzifni_website/features/home/ui/widgets/contact_section.dart';
import 'package:wazzifni_website/features/home/ui/widgets/drawer_widget.dart';
import 'package:wazzifni_website/features/home/ui/widgets/footer_widget.dart';
import 'package:wazzifni_website/features/home/ui/widgets/how_works_widget.dart';
import 'package:wazzifni_website/features/home/ui/widgets/top_widget.dart';
import 'package:wazzifni_website/features/home/ui/widgets/traning_section.dart';
import 'package:wazzifni_website/features/home/ui/widgets/wazzifni_widget.dart';
import 'package:wazzifni_website/features/home/ui/widgets/why_wazzifni_section.dart';


class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      child: Column(
        children: [
          WazzifniWidget(),
          WhyWazzifniSection(),
          HowItWorksSection(),
          TrainingServicesSection(),
          AboutAppSection(),
          AboutCompanySection(),
          ContactSection(),
          Divider(height: 1, thickness: 1),
          Footer(),
        ],
      ),
    );
  }
}
