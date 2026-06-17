import 'dart:io';
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
      context.read<TicketBloc>().add(
        SubmitTicketEvent(
          stationId: _stationIdController.text,
          subject: _subjectController.text,
          description: _descriptionController.text,
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
      barrierColor: Colors.black.withOpacity(0.8),
      builder: (_) => ScaleTransition(
        scale: _scaleAnimation,
        child: AlertDialog(
          backgroundColor: const Color(0xFF1E293B), // Slate 800
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: color.withOpacity(0.5))),
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
              Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 12),
              Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 15, height: 1.5)),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {
                      _stationIdController.clear();
                      _subjectController.clear();
                      _descriptionController.clear();
                      _imageFile = null;
                    });
                  },
                  child: const Text('CONTINUE', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
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
      backgroundColor: const Color(0xFF0F172A), // Slate 900
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1E3A8A), Color(0xFF0F172A)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),
        title: const Text('Raise Field Ticket', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5)),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocConsumer<TicketBloc, TicketState>(
        listener: (context, state) {
          if (state is TicketSuccess) {
            _showAnimatedDialog('Ticket Sent', 'Admin has been notified. Resolution target: 24-48 business hours.', Icons.check_circle_outline, const Color(0xFF10B981));
          } else if (state is TicketOfflineSaved) {
            _showAnimatedDialog('Saved Offline', 'No network detected. Ticket stored as draft and will upload automatically.', Icons.cloud_off, const Color(0xFFF59E0B));
          } else if (state is TicketError) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message), backgroundColor: Colors.redAccent, behavior: SnackBarBehavior.floating));
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Station Details Section
                    _buildSectionTitle('Location Data', Icons.location_on),
                    const SizedBox(height: 16),
                    _buildGlassCard(
                      child: TextFormField(
                        controller: _stationIdController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Station ID (e.g., STN-260)', prefixIcon: Icon(Icons.qr_code_scanner, color: Color(0xFF3B82F6))),
                        validator: (v) => v!.isEmpty ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    // Metadata Section
                    _buildSectionTitle('Issue Metadata', Icons.report_problem),
                    const SizedBox(height: 16),
                    _buildGlassCard(
                      child: Column(
                        children: [
                          TextFormField(
                            controller: _subjectController,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(labelText: 'Issue Subject', prefixIcon: Icon(Icons.short_text, color: Color(0xFF3B82F6))),
                            validator: (v) => v!.isEmpty ? 'Required' : null,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _descriptionController,
                            style: const TextStyle(color: Colors.white),
                            maxLines: 4,
                            decoration: const InputDecoration(labelText: 'Detailed Description', alignLabelWithHint: true),
                            validator: (v) => v!.isEmpty ? 'Required' : null,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Media Section
                    _buildSectionTitle('Media Evidence', Icons.camera),
                    const SizedBox(height: 16),
                    InkWell(
                      onTap: _takePicture,
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        height: 160,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B).withOpacity(0.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: _imageFile != null
                            ? Stack(
                                fit: StackFit.expand,
                                children: [
                                  ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.file(_imageFile!, fit: BoxFit.cover)),
                                  Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(16),
                                      gradient: LinearGradient(begin: Alignment.bottomCenter, end: Alignment.center, colors: [Colors.black.withOpacity(0.7), Colors.transparent]),
                                    ),
                                  ),
                                  const Positioned(bottom: 12, right: 12, child: Icon(Icons.refresh, color: Colors.white, size: 28)),
                                ],
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(color: const Color(0xFF3B82F6).withOpacity(0.1), shape: BoxShape.circle),
                                    child: const Icon(Icons.camera_alt, size: 32, color: Color(0xFF3B82F6)),
                                  ),
                                  const SizedBox(height: 16),
                                  const Text('Tap to capture field evidence', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 48),

                    // Submit Button
                    if (state is TicketLoading)
                      const Center(child: CircularProgressIndicator())
                    else
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 6)),
                          ],
                          gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF3B82F6)]),
                        ),
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: _submit,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.cloud_upload, size: 20),
                              SizedBox(width: 8),
                              Text('SUBMIT TICKET', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: Colors.white, size: 20),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
      ],
    );
  }

  Widget _buildGlassCard({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B), // Solid slate
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155), width: 1),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: child,
    );
  }
}
