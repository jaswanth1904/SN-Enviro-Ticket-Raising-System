import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../bloc/ticket_bloc.dart';

class TicketFormPage extends StatefulWidget {
  const TicketFormPage({super.key});

  @override
  State<TicketFormPage> createState() => _TicketFormPageState();
}

class _TicketFormPageState extends State<TicketFormPage> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _stationIdController = TextEditingController();
  final _locationController = TextEditingController();
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  File? _imageFile;
  final ImagePicker _picker = ImagePicker();

  late AnimationController _dialogAnimController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _dialogAnimController = AnimationController(vsync: this, duration: const Duration(milliseconds: 400));
    _scaleAnimation = CurvedAnimation(parent: _dialogAnimController, curve: Curves.elasticOut);
  }

  @override
  void dispose() {
    _stationIdController.dispose();
    _locationController.dispose();
    _subjectController.dispose();
    _descriptionController.dispose();
    _dialogAnimController.dispose();
    super.dispose();
  }

  Future<void> _takePicture() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      setState(() {
        _imageFile = File(photo.path);
      });
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final combinedDescription = 'Location: ${_locationController.text}\n\n${_descriptionController.text}';
      context.read<TicketBloc>().add(
        SubmitTicketEvent(
          stationId: _stationIdController.text,
          subject: _subjectController.text,
          description: combinedDescription,
          rawImage: _imageFile,
        ),
      );
    }
  }

  void _showAnimatedDialog(String title, String subtitle, IconData icon, Color color) {
    _dialogAnimController.forward(from: 0.0);
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withOpacity(0.4),
      builder: (_) => ScaleTransition(
        scale: _scaleAnimation,
        child: AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          contentPadding: const EdgeInsets.all(32),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                child: Icon(icon, size: 48, color: color),
              ),
              const SizedBox(height: 24),
              Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black)),
              const SizedBox(height: 12),
              Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF666666), fontSize: 15, height: 1.5)),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF007AFF),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {
                      _stationIdController.clear();
                      _locationController.clear();
                      _subjectController.clear();
                      _descriptionController.clear();
                      _imageFile = null;
                    });
                  },
                  child: const Text('Continue', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Raise Field Ticket', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE5E5EA), height: 1.0),
        ),
      ),
      body: BlocConsumer<TicketBloc, TicketState>(
        listener: (context, state) {
          if (state is TicketSuccess) {
            _showAnimatedDialog('Ticket Sent', 'Admin has been notified. Resolution target: 24-48 business hours.', Icons.check_circle, const Color(0xFF34C759));
          } else if (state is TicketOfflineSaved) {
            _showAnimatedDialog('Saved Offline', 'No network detected. Ticket stored as draft and will upload automatically.', Icons.cloud_off, const Color(0xFFFF9500));
          } else if (state is TicketError) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message), backgroundColor: const Color(0xFFFF3B30), behavior: SnackBarBehavior.floating));
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionTitle('LOCATION DETAILS'),
                    const SizedBox(height: 8),
                    _buildFormCard(
                      children: [
                        TextFormField(
                          controller: _stationIdController,
                          decoration: const InputDecoration(
                            labelText: 'Station Name',
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            fillColor: Colors.transparent,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                        const Divider(height: 1, color: Color(0xFFE5E5EA), indent: 16),
                        TextFormField(
                          controller: _locationController,
                          decoration: const InputDecoration(
                            labelText: 'Location',
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            fillColor: Colors.transparent,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    
                    _buildSectionTitle('ISSUE DETAILS'),
                    const SizedBox(height: 8),
                    _buildFormCard(
                      children: [
                        TextFormField(
                          controller: _subjectController,
                          decoration: const InputDecoration(
                            labelText: 'Issue Subject',
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            fillColor: Colors.transparent,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                        const Divider(height: 1, color: Color(0xFFE5E5EA), indent: 16),
                        TextFormField(
                          controller: _descriptionController,
                          maxLines: 4,
                          decoration: const InputDecoration(
                            labelText: 'Detailed Description',
                            alignLabelWithHint: true,
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            fillColor: Colors.transparent,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    _buildSectionTitle('MEDIA EVIDENCE'),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: _takePicture,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        height: 180,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: _imageFile != null
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: kIsWeb 
                                  ? Image.network(_imageFile!.path, fit: BoxFit.cover)
                                  : Image.file(_imageFile!, fit: BoxFit.cover),
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.camera_alt, size: 40, color: Color(0xFF007AFF)),
                                  const SizedBox(height: 12),
                                  Text('Tap to Capture Image', style: TextStyle(color: const Color(0xFF007AFF).withOpacity(0.8), fontWeight: FontWeight.w500, fontSize: 16)),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 40),

                    if (state is TicketLoading)
                      const Center(child: CircularProgressIndicator(color: Color(0xFF007AFF)))
                    else
                      ElevatedButton(
                        onPressed: _submit,
                        child: const Text('Submit Ticket'),
                      ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 16.0, bottom: 4.0),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF8E8E93),
          fontSize: 13,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.1,
        ),
      ),
    );
  }

  Widget _buildFormCard({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: children,
      ),
    );
  }
}
