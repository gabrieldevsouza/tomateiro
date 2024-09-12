extends Node

@export var cycle_time : CycleTimeController

@export var play_button : AutoSizeMaterialButton
@export var pause_button : AutoSizeMaterialButton


func _ready() -> void:
	play_button.pressed.connect(on_play_pressed)
	pause_button.pressed.connect(on_pause_pressed)

	cycle_time.play_signal.connect(on_play)
	cycle_time.pause_signal.connect(on_pause)
	cycle_time.repeat_signal.connect(on_repeat)
	cycle_time.prepare_signal.connect(on_prepare)

	if cycle_time.state == CycleTimeController.PomodoroState.PLAY:
		on_play()
	else:
		on_pause()

func on_prepare() -> void:
	if cycle_time.can_user_play():
		on_pause()

func on_play_pressed() -> void:
	print(cycle_time.can_user_play())
	if not cycle_time.can_user_play():
		return
	cycle_time.play()

func on_pause_pressed() -> void:
	if not cycle_time.can_user_play():
		return
	cycle_time.pause()

func on_play() -> void:
	show_pause_button()

func on_pause() -> void:
	show_play_button()

func on_repeat() -> void:
	show_play_button()

func show_play_button() -> void:
	pause_button.set_font_size(pause_button.get_font_size())

	pause_button.visible = false
	play_button.visible = true

func show_pause_button() -> void:
	pause_button.set_font_size(play_button.get_font_size())

	play_button.visible = false
	pause_button.visible = true
