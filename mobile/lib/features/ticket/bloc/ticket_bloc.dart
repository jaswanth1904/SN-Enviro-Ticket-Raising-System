import 'dart:io';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:geolocator/geolocator.dart';
import '../data/ticket_repository.dart';
import '../domain/ticket_model.dart';
import '../../../core/utils/image_optimizer.dart';

// Events
abstract class TicketEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class SubmitTicketEvent extends TicketEvent {
  final String stationId;
  final String subject;
  final String description;
  final File? rawImage;

  SubmitTicketEvent({
    required this.stationId,
    required this.subject,
    required this.description,
    this.rawImage,
  });
}

// States
abstract class TicketState extends Equatable {
  @override
  List<Object?> get props => [];
}

class TicketInitial extends TicketState {}
class TicketLoading extends TicketState {}
class TicketSuccess extends TicketState {}
class TicketOfflineSaved extends TicketState {}
class TicketError extends TicketState {
  final String message;
  TicketError(this.message);

  @override
  List<Object?> get props => [message];
}

// BLoC
class TicketBloc extends Bloc<TicketEvent, TicketState> {
  final TicketRepository repository;

  TicketBloc({required this.repository}) : super(TicketInitial()) {
    on<SubmitTicketEvent>((event, emit) async {
      emit(TicketLoading());
      try {
        // 1. Optimize Image
        File? compressedFile;
        if (event.rawImage != null) {
          compressedFile = await ImageOptimizer.compressImage(event.rawImage!);
        }

        // 2. Fetch GPS
        Position? position;
        try {
          bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
          if (serviceEnabled) {
            LocationPermission permission = await Geolocator.checkPermission();
            if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
              position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
            }
          }
        } catch (_) {
          // GPS failure shouldn't block ticket submission
        }

        // 3. Build Model
        final ticket = TicketModel(
          stationId: event.stationId,
          subject: event.subject,
          description: event.description,
          localImagePath: compressedFile?.path,
          latitude: position?.latitude,
          longitude: position?.longitude,
        );

        // 4. Submit via Repository
        final bool isOnlineSuccess = await repository.submitTicket(ticket);

        if (isOnlineSuccess) {
          emit(TicketSuccess());
        } else {
          emit(TicketOfflineSaved());
        }
      } catch (e) {
        emit(TicketError('Unexpected error occurred: $e'));
      }
    });
  }
}
