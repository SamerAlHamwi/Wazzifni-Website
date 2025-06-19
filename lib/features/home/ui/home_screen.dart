

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
  const HomePage({super.key,required this.onChangeTap});

  final Function(int) onChangeTap;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          const WazzifniWidget(),
          const WhyWazzifniSection(),
          const HowItWorksSection(),
          const TrainingServicesSection(),
          const AboutAppSection(),
          const AboutCompanySection(),
          const ContactSection(),
          const Divider(height: 1, thickness: 1),
          Footer(onChangeTap: onChangeTap,),
        ],
      ),
    );
  }
}
