@tool
extends AspectRatioContainer
class_name HStackableRatioContainer

@onready var container: BoxContainer = get_parent()

@export var ratio_limited_by_parent_width : bool = true

@export_range(0.001, 10) var stack_ratio : float = 1 :
	set(value):

		if container == null:
			container = get_parent()

		if container != null:
			# print(container.get_minimum_size(), "  ::  ", container.size.x, "  ::  ", container.get_parent_area_size().x)
			if value * container.size.y > container.get_parent_area_size().x and ratio_limited_by_parent_width:
				value = container.get_parent_area_size().x / container.size.y

			# print(container.get_minimum_size(), "  ::  ", container.size.x, "  ::  ", container.get_parent_area_size().x)
			# if value * container.size.y > container.size.x:
			# 	value = container.size.x / container.size.y

		stack_ratio = value
		compute()
	

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	container = get_parent()
	resized.connect(compute)
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func compute() -> void:
	if container == null:
		container = get_parent()
		if container == null:
			return
	custom_minimum_size.x = container.size.y * stack_ratio
	pass
