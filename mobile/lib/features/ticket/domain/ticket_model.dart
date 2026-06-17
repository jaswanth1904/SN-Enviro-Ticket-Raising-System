import 'package:equatable/equatable.dart';

class TicketModel extends Equatable {
  final String? id;
  final String stationId;
  final String subject;
  final String description;
  final String? localImagePath;
  final double? latitude;
  final double? longitude;
  final bool isOfflineDraft;

  const TicketModel({
    this.id,
    required this.stationId,
    required this.subject,
    required this.description,
    this.localImagePath,
    this.latitude,
    this.longitude,
    this.isOfflineDraft = false,
  });

  factory TicketModel.fromJson(Map<dynamic, dynamic> json) {
    return TicketModel(
      id: json['_id'],
      stationId: json['stationId'],
      subject: json['subject'],
      description: json['description'],
      localImagePath: json['localImagePath'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      isOfflineDraft: json['isOfflineDraft'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stationId': stationId,
      'subject': subject,
      'description': description,
      'localImagePath': localImagePath,
      'latitude': latitude,
      'longitude': longitude,
      'isOfflineDraft': isOfflineDraft,
    };
  }

  @override
  List<Object?> get props => [id, stationId, subject, description, localImagePath, latitude, longitude, isOfflineDraft];
}
