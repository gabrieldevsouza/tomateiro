extends Resource
class_name CycleTimeController

enum PomodoroState {PREPARE, PLAY, PAUSE, STOP}

@export var round_controller : RoundController

var state : PomodoroState = PomodoroState.PREPARE

var remaining_seconds : FloatVar

var finish_cycle_time : float = 0
var start_cycle_time : float = 0.0


signal prepare_signal
signal play_signal
signal pause_signal
signal repeat_signal
signal tick_signal
signal finish_signal

func bootstrap() -> void:

	load_resources()

func initialize_values() -> void:
	if remaining_seconds.value <= 0:
		remaining_seconds.value = round_controller.current_cycle_time


func load_resources() -> void:
	remaining_seconds = ResourceLoader.load("user://remaining_seconds.tres")

	if remaining_seconds == null:
		remaining_seconds = FloatVar.new()
		remaining_seconds.value = 0

func prepare() -> void:
	state = PomodoroState.STOP

	initialize_values()

	prepare_signal.emit()

	if not round_controller.can_user_play():
		play()

func can_user_play() -> bool:
	return round_controller.can_user_play()

func play() -> void:
	if state == PomodoroState.PLAY:
		return

	start_cycle_time = Time.get_unix_time_from_system()
	finish_cycle_time = start_cycle_time + remaining_seconds.value

	state = PomodoroState.PLAY

	play_signal.emit()

func pause() -> void:
	if not state == PomodoroState.PLAY:
		return
		
	state = PomodoroState.PAUSE
	
	pause_signal.emit()

func repeat() -> void:
	state = PomodoroState.STOP
	remaining_seconds.value = round_controller.current_cycle_time
	ResourceSaver.save(remaining_seconds, "user://remaining_seconds.tres")

	prepare()

	repeat_signal.emit()

func finish () -> void:
	state = PomodoroState.STOP
	remaining_seconds.value = 0

	round_controller.prepare_next_cycle()

	finish_signal.emit()
	prepare()

func tick_iteration() -> void:
	if not state == PomodoroState.PLAY:
		return
	
	var currentTime = Time.get_unix_time_from_system()
	
	var timeDifference = finish_cycle_time - currentTime
	
	if timeDifference > 0:
		remaining_seconds.value = timeDifference

		tick_signal.emit()
	else:
		remaining_seconds.value = int(0)
		finish()
	
	ResourceSaver.save(remaining_seconds, "user://remaining_seconds.tres")


func get_progress () -> float:
	return remaining_seconds.value / round_controller.current_cycle_time
